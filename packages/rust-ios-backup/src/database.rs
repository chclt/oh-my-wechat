use crate::errors::BackupError;
use rusqlite::{Connection, MAIN_DB};

/// Same read-only in-memory snapshot and WAL-header normalization as
/// createWasmExecutor. Never change the source database or its sidecars.
pub(crate) fn open_snapshot(mut bytes: Vec<u8>) -> Result<Connection, BackupError> {
    if bytes.len() >= 20 && bytes.starts_with(b"SQLite format 3\0") && bytes[18..20] == [2, 2] {
        bytes[18..20].copy_from_slice(&[1, 1]);
    }
    let mut connection = Connection::open_in_memory()
        .map_err(|error| BackupError::context("Cannot open backup database", error))?;
    connection
        .deserialize_read_exact(MAIN_DB, bytes.as_slice(), bytes.len(), true)
        .map_err(|error| BackupError::context("Cannot open backup database", error))?;
    Ok(connection)
}
