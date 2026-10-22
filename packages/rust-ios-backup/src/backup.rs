use crate::{
    account::{read_account_list, Account},
    database::open_snapshot,
    encryption::{parse_plist, BackupEncryption, MAX_PLIST_BYTES},
    errors::BackupError,
};
use rusqlite::Connection;
use std::{
    fs::File,
    io::{ErrorKind, Read},
    path::{Path, PathBuf},
    sync::Mutex,
};
use zeroize::Zeroizing;

pub(crate) struct LoadedBackup {
    pub(crate) directory: PathBuf,
    pub(crate) manifest: Mutex<Connection>,
    pub(crate) accounts: Vec<Account>,
    pub(crate) encryption: Option<BackupEncryption>,
}

impl LoadedBackup {
    pub(crate) fn open(
        directory: PathBuf,
        password: Option<String>,
        check_cancelled: impl Fn() -> Result<(), BackupError>,
    ) -> Result<Self, BackupError> {
        let password = password.map(Zeroizing::new);
        check_cancelled()?;
        let encryption = match read_manifest_info(&directory)? {
            Some(info) => BackupEncryption::open(
                &info,
                password.as_ref().map(|value| value.as_str()),
                &check_cancelled,
            )?,
            None => None,
        };
        drop(password);
        check_cancelled()?;
        let bytes = read_manifest(&directory, encryption.as_ref(), &check_cancelled)?;
        let manifest = open_snapshot(bytes)?;
        let accounts =
            read_account_list(&manifest, &directory, encryption.as_ref(), &check_cancelled)?.data;
        check_cancelled()?;
        Ok(Self {
            directory,
            manifest: Mutex::new(manifest),
            accounts,
            encryption,
        })
    }
}

fn read_manifest_info(directory: &Path) -> Result<Option<plist::Dictionary>, BackupError> {
    let file = match File::open(directory.join("Manifest.plist")) {
        Ok(file) => file,
        Err(error) if error.kind() == ErrorKind::NotFound => return Ok(None),
        Err(error) => return Err(BackupError::context("无法读取 Manifest.plist", error)),
    };
    let mut bytes = Vec::new();
    file.take(MAX_PLIST_BYTES as u64 + 1)
        .read_to_end(&mut bytes)
        .map_err(|error| BackupError::context("无法读取 Manifest.plist", error))?;
    if bytes.len() > MAX_PLIST_BYTES {
        return Err(BackupError::invalid(
            "Manifest.plist exceeds the size limit",
        ));
    }
    Ok(Some(parse_plist(&bytes)?))
}

fn read_manifest(
    directory: &Path,
    encryption: Option<&BackupEncryption>,
    check_cancelled: &impl Fn() -> Result<(), BackupError>,
) -> Result<Vec<u8>, BackupError> {
    let mut manifest = File::open(directory.join("Manifest.db")).map_err(|error| {
        if error.kind() == ErrorKind::NotFound {
            BackupError::new(
                "MissingBackupManifestError",
                "Manifest.db was not found in the backup directory",
            )
        } else {
            BackupError::context("无法读取 Manifest.db", error)
        }
    })?;
    let mut bytes = Vec::new();
    manifest
        .read_to_end(&mut bytes)
        .map_err(|error| BackupError::context("无法读取 Manifest.db", error))?;
    check_cancelled()?;
    if let Some(encryption) = encryption {
        encryption.decrypt_manifest(bytes, check_cancelled)
    } else if bytes.starts_with(b"SQLite format 3\0") {
        Ok(bytes)
    } else {
        Err(BackupError::invalid(
            "Manifest.db is not readable; encrypted backups require Manifest.plist",
        ))
    }
}
