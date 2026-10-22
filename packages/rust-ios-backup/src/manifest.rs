use crate::{backup::LoadedBackup, encryption::BackupEncryption, errors::BackupError};
use rusqlite::{Connection, OptionalExtension};
use std::{
    ffi::OsStr,
    fs,
    io::ErrorKind,
    path::{Path, PathBuf},
};

pub(crate) struct ManifestFile {
    pub(crate) relative_path: String,
    pub(crate) path: PathBuf,
    metadata: Option<Vec<u8>>,
}

impl ManifestFile {
    pub(crate) fn from_record(
        directory: &Path,
        id: &str,
        relative_path: String,
        metadata: Option<Vec<u8>>,
    ) -> Result<Self, BackupError> {
        let prefix: String = id.chars().take(2).collect();
        // Both the file ID and its prefix must stay within the backup directory.
        if Path::new(id).file_name() != Some(OsStr::new(id)) || id.contains('\\') || prefix == ".."
        {
            return Err(BackupError::invalid("Invalid backup file path"));
        }

        Ok(Self {
            relative_path,
            path: directory.join(prefix).join(id),
            metadata,
        })
    }

    pub(crate) fn read(
        &self,
        encryption: Option<&BackupEncryption>,
        check_cancelled: &impl Fn() -> Result<(), BackupError>,
    ) -> Result<Vec<u8>, BackupError> {
        check_cancelled()?;
        let bytes = fs::read(&self.path).map_err(|error| {
            BackupError::context(format!("Cannot read {}", self.relative_path), error)
        })?;
        check_cancelled()?;
        match encryption {
            Some(encryption) => {
                let metadata = self.metadata.as_deref().ok_or_else(|| {
                    BackupError::invalid(format!(
                        "Missing encryption metadata for backup file: {}",
                        self.relative_path
                    ))
                })?;
                encryption.decrypt(bytes, metadata, check_cancelled)
            }
            None => Ok(bytes),
        }
    }
}

pub(crate) fn find_file(
    backup: &LoadedBackup,
    relative_path: &str,
) -> Result<ManifestFile, BackupError> {
    let manifest = backup
        .manifest
        .lock()
        .map_err(|error| BackupError::context("Manifest database unavailable", error))?;
    let record: Option<(String, Option<Vec<u8>>)> = manifest.query_row(
        "SELECT fileID, file FROM Files WHERE domain = 'AppDomain-com.tencent.xin' AND relativePath = ?1 AND flags = 1 LIMIT 1",
        [relative_path], |row| Ok((row.get(0)?, row.get(1)?)),
    ).optional().map_err(|error| BackupError::context("Cannot query media file", error))?;
    let (id, metadata) = record.filter(|(id, _)| !id.is_empty()).ok_or_else(|| {
        BackupError::new(
            "Error",
            format!("[messageFile] file not found for uri: ios-backup:{relative_path}"),
        )
    })?;
    ManifestFile::from_record(&backup.directory, &id, relative_path.to_owned(), metadata)
}

/// Equivalent to getFilesFromManifast, leaving content reads to the caller so
/// loading message shards does not hold all source byte buffers at once.
pub(crate) fn find_files(
    connection: &Connection,
    directory: &Path,
    pattern: &str,
) -> Result<Vec<ManifestFile>, BackupError> {
    let mut statement = connection.prepare(
        "SELECT fileID, relativePath, file FROM Files WHERE domain = 'AppDomain-com.tencent.xin' AND relativePath LIKE ?1 AND flags = 1 ORDER BY relativePath"
    ).map_err(|error| BackupError::context("Cannot query Manifest.db", error))?;
    let rows = statement
        .query_map([pattern], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, Option<Vec<u8>>>(2)?,
            ))
        })
        .map_err(|error| BackupError::context("Cannot query Manifest.db", error))?;
    let mut files = Vec::new();
    for row in rows {
        let (id, relative_path, metadata) =
            row.map_err(|error| BackupError::context("Invalid Manifest.db file record", error))?;
        if id.is_empty() {
            continue;
        }
        let file = ManifestFile::from_record(directory, &id, relative_path, metadata)?;
        match fs::metadata(&file.path) {
            Ok(file_info) if file_info.is_file() => files.push(file),
            Err(error) if error.kind() == ErrorKind::NotFound => continue,
            Ok(_) => {
                return Err(BackupError::invalid(format!(
                    "Backup entry is not a file: {}",
                    file.relative_path
                )))
            }
            Err(error) => {
                return Err(BackupError::context(
                    format!("Cannot access {}", file.relative_path),
                    error,
                ))
            }
        }
    }
    Ok(files)
}
