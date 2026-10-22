pub(crate) mod database;

use crate::{encryption::BackupEncryption, errors::BackupError, manifest::find_files};
use prost::encoding::{decode_key, decode_varint, skip_field, DecodeContext, WireType};
use rusqlite::Connection;
use std::path::Path;

#[cfg(test)]
pub(crate) mod tests;

// Match the fields actually produced by parseUserFromMmsetting, including
// omitted fields versus empty strings. Do not invent is_openim or user_id.
#[derive(Clone, Debug, Default, serde::Serialize)]
pub(crate) struct Account {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) user_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) bio: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) phone: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) background: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) photo: Option<Photo>,
}

#[derive(Clone, Debug, serde::Serialize)]
pub(crate) struct Photo {
    pub(crate) thumb: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) origin: Option<String>,
}

#[derive(serde::Serialize)]
pub(crate) struct AccountList {
    pub(crate) data: Vec<Account>,
}

fn read_bytes<'a>(input: &mut &'a [u8]) -> Result<&'a [u8], BackupError> {
    let length =
        decode_varint(input).map_err(|_| BackupError::invalid("Invalid account data length"))?;
    let length =
        usize::try_from(length).map_err(|_| BackupError::invalid("Invalid account data length"))?;
    if length > input.len() {
        return Err(BackupError::invalid("Truncated account data"));
    }
    let (value, remaining) = input.split_at(length);
    *input = remaining;
    Ok(value)
}

fn decode_text(bytes: &[u8]) -> String {
    // TextDecoder('utf-8') drops a leading BOM and replaces invalid UTF-8.
    String::from_utf8_lossy(bytes.strip_prefix(&[0xef, 0xbb, 0xbf]).unwrap_or(bytes)).into_owned()
}

fn parse_local_info(mut input: &[u8]) -> Result<String, BackupError> {
    while !input.is_empty() {
        let (field, wire) = decode_key(&mut input)
            .map_err(|_| BackupError::invalid("Failed to parse Documents/LocalInfo.data"))?;
        if (field == 1 || field == 2) && wire == WireType::LengthDelimited {
            let id = decode_text(read_bytes(&mut input)?);
            if !id.is_empty() {
                return Ok(id);
            }
        } else {
            skip_field(wire, field, &mut input, DecodeContext::default())
                .map_err(|_| BackupError::invalid("Failed to parse Documents/LocalInfo.data"))?;
        }
    }
    Err(BackupError::invalid(
        "Failed to parse Documents/LocalInfo.data",
    ))
}

// The web parser clamps slices to the available bytes, including truncated
// values. Missing bytes in a length are treated as zero by its bitwise reader.
fn read_mmsetting_field<'a>(input: &mut &'a [u8]) -> &'a [u8] {
    let mut length = 0u32;
    let mut shift = 0u32;
    while let Some((&byte, rest)) = input.split_first() {
        *input = rest;
        length |= u32::from(byte & 0x7f).wrapping_shl(shift);
        if byte & 0x80 == 0 {
            break;
        }
        shift = shift.wrapping_add(7);
    }
    let (value, rest) = input.split_at((length as usize).min(input.len()));
    *input = rest;
    value
}

fn parse_mmsetting(bytes: &[u8]) -> Account {
    let mut input = bytes.get(8..).unwrap_or_default();
    let mut account = Account::default();
    let mut keys: Vec<&[u8]> = vec![
        b"headimgurl",
        b"headhdimgurl",
        b"63",
        b"86",
        b"87",
        b"88",
        b"89",
        b"91",
    ];
    while !input.is_empty() && !keys.is_empty() {
        let key = read_mmsetting_field(&mut input);
        let value = read_mmsetting_field(&mut input);
        let Some(index) = keys.iter().position(|candidate| *candidate == key) else {
            continue;
        };
        keys.remove(index); // Like the web parser, the first occurrence wins.
        let prefix = if key == b"headimgurl" || key == b"headhdimgurl" {
            2
        } else {
            1
        };
        let text = decode_text(value.get(prefix..).unwrap_or_default());
        match key {
            b"86" => account.id = Some(text),
            b"87" => account.user_id = Some(text),
            b"88" => account.username = Some(text),
            b"89" => account.bio = Some(text),
            b"91" => account.phone = Some(text),
            b"63" => account.background = Some(text),
            b"headimgurl" => match &mut account.photo {
                Some(photo) => photo.thumb = text,
                None => {
                    account.photo = Some(Photo {
                        thumb: text,
                        origin: None,
                    })
                }
            },
            b"headhdimgurl" => match &mut account.photo {
                Some(photo) => photo.origin = Some(text),
                None => {
                    account.photo = Some(Photo {
                        thumb: text.clone(),
                        origin: Some(text),
                    })
                }
            },
            _ => unreachable!(),
        }
    }
    account
}

pub(crate) fn read_account_list(
    connection: &Connection,
    directory: &Path,
    encryption: Option<&BackupEncryption>,
    check_cancelled: impl Fn() -> Result<(), BackupError>,
) -> Result<AccountList, BackupError> {
    check_cancelled()?;
    let local_info = find_files(connection, directory, "Documents/LocalInfo.data")?;
    let file = local_info.first().ok_or_else(|| {
        BackupError::new(
            "MissingWechatDataError",
            "Wechat account information was not found in the backup",
        )
    })?;
    let bytes = file.read(encryption, &check_cancelled)?;
    let logged_in = parse_local_info(&bytes)?;
    let mut accounts = Vec::new();
    for file in find_files(
        connection,
        directory,
        "Documents/MMappedKV/mmsetting.archive.%",
    )? {
        check_cancelled()?;
        let filename = file.relative_path.rsplit('/').next().unwrap_or_default();
        if let Some(suffix) = filename.strip_prefix("mmsetting.archive.") {
            if !suffix.is_empty() && !suffix.contains('.') {
                let bytes = file.read(encryption, &check_cancelled)?;
                accounts.push(parse_mmsetting(&bytes));
            }
        }
    }
    if accounts.is_empty() {
        return Err(BackupError::new(
            "MissingWechatDataError",
            "No readable Wechat accounts were found in the backup",
        ));
    }
    accounts.sort_by_key(|account| account.id.as_deref() != Some(logged_in.as_str()));
    Ok(AccountList { data: accounts })
}
