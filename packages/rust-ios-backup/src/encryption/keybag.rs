// Format references (also used by the web adapter):
// https://github.com/jsharkey13/iphone_backup_decrypt/blob/35984e59d76478ea4e0bc1086b2c0e2a5ad25ef2/src/iphone_backup_decrypt/google_iphone_dataprotection.py
// https://github.com/avibrazil/iOSbackup/blob/76666902d69c1758a673a9142e45cf8d6ed40210/iOSbackup/__init__.py
// RustCrypto provides PBKDF2 and RFC 3394 AES-KW, including integrity checks.
use crate::errors::BackupError;
use aes_kw::KekAes256;
use pbkdf2::pbkdf2_hmac;
use sha1::Sha1;
use sha2::Sha256;
use std::collections::BTreeMap;
use zeroize::Zeroizing;

type Fields<'a> = BTreeMap<String, &'a [u8]>;

fn number(fields: &Fields<'_>, tag: &str) -> Result<u32, BackupError> {
    let bytes: [u8; 4] = fields
        .get(tag)
        .and_then(|bytes| (*bytes).try_into().ok())
        .ok_or_else(|| BackupError::invalid(format!("Missing or invalid keybag field: {tag}")))?;
    Ok(u32::from_be_bytes(bytes))
}

fn salt<'a>(fields: &Fields<'a>, tag: &str) -> Result<&'a [u8], BackupError> {
    fields
        .get(tag)
        .copied()
        .filter(|bytes| !bytes.is_empty() && bytes.len() <= 1024)
        .ok_or_else(|| BackupError::invalid(format!("Missing or invalid keybag field: {tag}")))
}

fn iterations(fields: &Fields<'_>, tag: &str, maximum: u32) -> Result<u32, BackupError> {
    let count = number(fields, tag)?;
    if count == 0 || count > maximum {
        return Err(BackupError::invalid(format!(
            "Keybag iteration count is out of range: {tag}"
        )));
    }
    Ok(count)
}

fn save_class<'a>(
    classes: &mut BTreeMap<u32, Fields<'a>>,
    fields: Fields<'a>,
) -> Result<(), BackupError> {
    let id = number(&fields, "CLAS")?;
    if classes.insert(id, fields).is_some() {
        return Err(BackupError::invalid(
            "Duplicate protection class in backup keybag",
        ));
    }
    Ok(())
}

fn parse(bytes: &[u8]) -> Result<(Fields<'_>, BTreeMap<u32, Fields<'_>>), BackupError> {
    let mut header = Fields::new();
    let mut class = None;
    let mut classes = BTreeMap::new();
    let mut input = bytes;
    while !input.is_empty() {
        if input.len() < 8 {
            return Err(BackupError::invalid("Truncated backup keybag"));
        }
        let tag = String::from_utf8_lossy(&input[..4]).into_owned();
        let length = u32::from_be_bytes(input[4..8].try_into().unwrap()) as usize;
        input = &input[8..];
        if length > input.len() {
            return Err(BackupError::invalid("Truncated backup keybag"));
        }
        if tag == "UUID" && header.contains_key("UUID") {
            if let Some(fields) = class.take() {
                save_class(&mut classes, fields)?;
            }
            class = Some(Fields::new());
        }
        let fields = class.as_mut().unwrap_or(&mut header);
        if fields.insert(tag.clone(), &input[..length]).is_some() {
            return Err(BackupError::invalid(format!(
                "Duplicate backup keybag field: {tag}"
            )));
        }
        input = &input[length..];
    }
    if let Some(fields) = class {
        save_class(&mut classes, fields)?;
    }
    if number(&header, "TYPE")? != 1 {
        return Err(BackupError::new(
            "UnsupportedBackupError",
            "Only local Finder / iTunes backup keybags are supported",
        ));
    }
    if classes.is_empty() {
        return Err(BackupError::invalid("Backup keybag contains no class keys"));
    }
    Ok((header, classes))
}

pub(super) struct BackupKeybag {
    keys: BTreeMap<u32, Zeroizing<[u8; 32]>>,
}

impl BackupKeybag {
    pub(super) fn unlock(
        bytes: &[u8],
        password: &str,
        check_cancelled: &impl Fn() -> Result<(), BackupError>,
    ) -> Result<Self, BackupError> {
        let (header, classes) = parse(bytes)?;
        let first_salt = salt(&header, "SALT")?;
        let count = iterations(&header, "ITER", 1_000_000)?;
        let second_stage = if header.contains_key("DPSL") || header.contains_key("DPIC") {
            Some((
                salt(&header, "DPSL")?,
                iterations(&header, "DPIC", 20_000_000)?,
            ))
        } else {
            None
        };
        for fields in classes.values() {
            if fields.get("WPKY").is_some_and(|key| key.len() != 40) {
                return Err(BackupError::invalid("Invalid wrapped class key length"));
            }
            number(fields, "WRAP")?;
        }
        check_cancelled()?;
        let mut intermediate = Zeroizing::new([0u8; 32]);
        let secret = if let Some((salt, count)) = second_stage {
            pbkdf2_hmac::<Sha256>(password.as_bytes(), salt, count, intermediate.as_mut());
            intermediate.as_ref()
        } else {
            password.as_bytes()
        };
        check_cancelled()?;
        let mut password_key = Zeroizing::new([0u8; 32]);
        pbkdf2_hmac::<Sha1>(secret, first_salt, count, password_key.as_mut());
        check_cancelled()?;
        let wrapping_key = KekAes256::new((&*password_key).into());
        let mut keys = BTreeMap::new();
        for (id, fields) in classes {
            check_cancelled()?;
            // WRAP is a bitfield. Other flags never bypass AES-KW integrity.
            if number(&fields, "WRAP")? & 2 == 0 {
                continue;
            }
            if let Some(wrapped) = fields.get("WPKY") {
                let mut key = Zeroizing::new([0u8; 32]);
                wrapping_key.unwrap(wrapped, key.as_mut()).map_err(|_| {
                    BackupError::new(
                        "BackupPasswordError",
                        "Incorrect backup password or damaged backup keybag",
                    )
                })?;
                keys.insert(id, key);
            }
        }
        check_cancelled()?;
        if keys.is_empty() {
            return Err(BackupError::new(
                "UnsupportedBackupError",
                "Backup keybag contains no password-wrapped class keys",
            ));
        }
        Ok(Self { keys })
    }

    pub(super) fn unwrap(
        &self,
        persistent_key: &[u8; 44],
    ) -> Result<Zeroizing<[u8; 32]>, BackupError> {
        let class = u32::from_le_bytes(persistent_key[..4].try_into().unwrap());
        let class_key = self.keys.get(&class).ok_or_else(|| {
            BackupError::new(
                "UnsupportedBackupError",
                format!("Unsupported or locked protection class: {class}"),
            )
        })?;
        let mut key = Zeroizing::new([0u8; 32]);
        KekAes256::new((&**class_key).into())
            .unwrap(&persistent_key[4..], key.as_mut())
            .map_err(|_| BackupError::invalid("Backup file key failed integrity verification"))?;
        Ok(key)
    }
}
