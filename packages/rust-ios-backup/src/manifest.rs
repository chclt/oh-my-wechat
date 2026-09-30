use crate::{encryption::BackupEncryption, errors::BackupError};
use rusqlite::Connection;
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
        let prefix: String = id.chars().take(2).collect();
        // Both the file ID and its prefix must stay within the backup directory.
        if Path::new(&id).file_name() != Some(OsStr::new(&id))
            || id.contains('\\')
            || prefix == ".."
        {
            return Err(BackupError::invalid("Invalid backup file path"));
        }
        let path = directory.join(prefix).join(&id);
        match fs::metadata(&path) {
            Ok(file_info) if file_info.is_file() => files.push(ManifestFile {
                relative_path,
                path,
                metadata,
            }),
            Err(error) if error.kind() == ErrorKind::NotFound => continue,
            Ok(_) => {
                return Err(BackupError::invalid(format!(
                    "Backup entry is not a file: {relative_path}"
                )))
            }
            Err(error) => {
                return Err(BackupError::context(
                    format!("Cannot access {relative_path}"),
                    error,
                ))
            }
        }
    }
    Ok(files)
}
