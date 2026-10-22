mod keybag;
#[cfg(test)]
mod tests;

use crate::errors::BackupError;
use aes::cipher::{
    block_padding::{NoPadding, Padding, Pkcs7},
    consts::U16,
    generic_array::GenericArray,
    BlockDecryptMut, KeyIvInit,
};
use keybag::BackupKeybag;
use plist::{Dictionary, Value};
use std::{collections::HashSet, io::Cursor};

pub(crate) const MAX_PLIST_BYTES: usize = 16 * 1024 * 1024;
const CHUNK_BYTES: usize = 1024 * 1024;

pub(crate) fn parse_plist(bytes: &[u8]) -> Result<Dictionary, BackupError> {
    if bytes.len() > MAX_PLIST_BYTES {
        return Err(BackupError::invalid(
            "Backup metadata exceeds the size limit",
        ));
    }
    let value = Value::from_reader(Cursor::new(bytes))
        .map_err(|_| BackupError::invalid("Invalid backup property list"))?;
    let mut pending = vec![(&value, 0)];
    while let Some((value, depth)) = pending.pop() {
        if depth > 64 {
            return Err(BackupError::invalid("Invalid backup property list"));
        }
        match value {
            Value::Array(values) => pending.extend(values.iter().map(|value| (value, depth + 1))),
            Value::Dictionary(values) => {
                pending.extend(values.values().map(|value| (value, depth + 1)))
            }
            _ => {}
        }
    }
    value
        .into_dictionary()
        .ok_or_else(|| BackupError::invalid("Invalid backup property list"))
}

fn data(value: Option<&Value>) -> Result<&[u8], BackupError> {
    value
        .and_then(Value::as_data)
        .ok_or_else(|| BackupError::invalid("Missing or invalid encryption key data"))
}

fn resolve<'a>(
    mut value: Option<&'a Value>,
    objects: &'a [Value],
) -> Result<Option<&'a Value>, BackupError> {
    let mut visited = HashSet::new();
    while let Some(Value::Uid(uid)) = value {
        let index = usize::try_from(uid.get())
            .map_err(|_| BackupError::invalid("Invalid object reference in file metadata"))?;
        if index >= objects.len() || !visited.insert(index) {
            return Err(BackupError::invalid(
                "Invalid object reference in file metadata",
            ));
        }
        value = objects.get(index);
    }
    Ok(value)
}

fn file_metadata(bytes: &[u8]) -> Result<(usize, Option<[u8; 44]>), BackupError> {
    let archive = parse_plist(bytes)?;
    let objects = archive.get("$objects").and_then(Value::as_array);
    let top = archive.get("$top").and_then(Value::as_dictionary);
    if archive.get("$archiver").and_then(Value::as_string) != Some("NSKeyedArchiver")
        || objects.is_none()
        || top.is_none()
    {
        return Err(BackupError::invalid(
            "File metadata is not a valid NSKeyedArchiver archive",
        ));
    }
    let objects = objects.unwrap();
    let root = resolve(top.unwrap().get("root"), objects)?
        .and_then(Value::as_dictionary)
        .ok_or_else(|| BackupError::invalid("Missing file metadata root object"))?;
    let size = resolve(root.get("Size"), objects)?
        .and_then(|value| {
            value.as_unsigned_integer().or_else(|| {
                value
                    .as_real()
                    .filter(|n| n.is_finite() && *n >= 0.0 && n.fract() == 0.0)
                    .map(|n| n as u64)
            })
        })
        .filter(|size| *size <= 9_007_199_254_740_991)
        .and_then(|size| usize::try_from(size).ok())
        .ok_or_else(|| BackupError::invalid("Invalid file size in metadata"))?;
    let mut key = resolve(root.get("EncryptionKey"), objects)?;
    if let Some(fields) = key.and_then(Value::as_dictionary) {
        key = resolve(fields.get("NS.data"), objects)?;
    }
    if key.is_none() || key.and_then(Value::as_string) == Some("$null") {
        if size != 0 {
            return Err(BackupError::invalid(
                "Missing encryption key for a nonempty file",
            ));
        }
        return Ok((size, None));
    }
    let key: [u8; 44] = data(key)?
        .try_into()
        .map_err(|_| BackupError::invalid("Invalid file encryption key length"))?;
    let embedded_class = u32::from_le_bytes(key[..4].try_into().unwrap());
    if let Some(class) = resolve(root.get("ProtectionClass"), objects)? {
        let class = class
            .as_unsigned_integer()
            .map(|n| n as f64)
            .or_else(|| class.as_real())
            .or_else(|| class.as_string().and_then(|s| s.parse().ok()))
            .or_else(|| class.as_boolean().map(|b| if b { 1.0 } else { 0.0 }));
        if class != Some(f64::from(embedded_class)) {
            return Err(BackupError::invalid(
                "File key protection class does not match metadata",
            ));
        }
    }
    Ok((size, Some(key)))
}

fn decrypt_cbc(
    mut bytes: Vec<u8>,
    key: &[u8; 32],
    size: Option<usize>,
    check_cancelled: &impl Fn() -> Result<(), BackupError>,
) -> Result<Vec<u8>, BackupError> {
    if !bytes.len().is_multiple_of(16) {
        return Err(BackupError::invalid(
            "Encrypted file length is not AES block aligned",
        ));
    }
    let mut iv = [0u8; 16];
    for chunk in bytes.chunks_mut(CHUNK_BYTES) {
        check_cancelled()?;
        let next_iv: [u8; 16] = chunk[chunk.len() - 16..].try_into().unwrap();
        cbc::Decryptor::<aes::Aes256>::new(key.into(), (&iv).into())
            .decrypt_padded_mut::<NoPadding>(chunk)
            .map_err(|_| BackupError::invalid("Cannot decrypt backup file"))?;
        iv = next_iv;
    }
    check_cancelled()?;
    if let Some(size) = size {
        // Exactly as on the web: valid PKCS#7 takes precedence over MBFile.Size.
        let padded_size = bytes.last_chunk::<16>().and_then(|last| {
            <Pkcs7 as Padding<U16>>::unpad(GenericArray::from_slice(last))
                .ok()
                .map(|unpadded| bytes.len() - 16 + unpadded.len())
        });
        let output_size = padded_size.unwrap_or(size);
        if output_size > bytes.len() {
            return Err(BackupError::invalid(
                "Encrypted file is shorter than the declared plaintext size",
            ));
        }
        bytes.truncate(output_size);
    }
    Ok(bytes)
}

pub(crate) struct BackupEncryption {
    keybag: BackupKeybag,
    manifest_key: Option<[u8; 44]>,
}

impl BackupEncryption {
    pub(crate) fn open(
        info: &Dictionary,
        password: Option<&str>,
        check_cancelled: &impl Fn() -> Result<(), BackupError>,
    ) -> Result<Option<Self>, BackupError> {
        match info.get("IsEncrypted").and_then(Value::as_boolean) {
            Some(false) => return Ok(None),
            Some(true) => {}
            None => {
                return Err(BackupError::invalid(
                    "Missing or invalid IsEncrypted flag in Manifest.plist",
                ))
            }
        }
        let password = password.ok_or_else(|| {
            BackupError::new("BackupPasswordRequiredError", "Backup password is required")
        })?;
        let keybag = data(info.get("BackupKeyBag"))?;
        let manifest_key = info
            .get("ManifestKey")
            .map(|value| {
                data(Some(value))?
                    .try_into()
                    .map_err(|_| BackupError::invalid("Invalid ManifestKey length"))
            })
            .transpose()?;
        Ok(Some(Self {
            keybag: BackupKeybag::unlock(keybag, password, check_cancelled)?,
            manifest_key,
        }))
    }

    pub(crate) fn decrypt_manifest(
        &self,
        bytes: Vec<u8>,
        check_cancelled: &impl Fn() -> Result<(), BackupError>,
    ) -> Result<Vec<u8>, BackupError> {
        check_cancelled()?;
        // Missing ManifestKey alone permits a plaintext manifest (legacy backups).
        let mut bytes = if let Some(key) = &self.manifest_key {
            let key = self.keybag.unwrap(key)?;
            decrypt_cbc(bytes, &key, None, check_cancelled)?
        } else {
            bytes
        };
        check_cancelled()?;
        if bytes.len() < 100 || !bytes.starts_with(b"SQLite format 3\0") {
            return Err(BackupError::invalid("Manifest.db is not a SQLite database"));
        }
        let encoded = u16::from_be_bytes(bytes[16..18].try_into().unwrap());
        let page_size = if encoded == 1 {
            65536
        } else {
            usize::from(encoded)
        };
        if !(512..=65536).contains(&page_size) || !page_size.is_power_of_two() {
            return Err(BackupError::invalid("Invalid Manifest.db page size"));
        }
        let tail = bytes.len() % page_size;
        if tail != 0
            && (self.manifest_key.is_none()
                || tail != 16
                || !bytes[bytes.len() - 16..].iter().all(|byte| *byte == 16))
        {
            return Err(BackupError::invalid(
                "Manifest.db is truncated or has invalid padding",
            ));
        }
        bytes.truncate(bytes.len() - tail);
        Ok(bytes)
    }

    pub(crate) fn decrypt(
        &self,
        bytes: Vec<u8>,
        metadata: &[u8],
        check_cancelled: &impl Fn() -> Result<(), BackupError>,
    ) -> Result<Vec<u8>, BackupError> {
        check_cancelled()?;
        let (size, key) = file_metadata(metadata)?;
        let Some(key) = key else {
            if !bytes.is_empty() {
                return Err(BackupError::invalid(
                    "Empty file metadata does not match stored content",
                ));
            }
            return Ok(bytes);
        };
        let key = self.keybag.unwrap(&key)?;
        decrypt_cbc(bytes, &key, Some(size), check_cancelled)
    }
}
