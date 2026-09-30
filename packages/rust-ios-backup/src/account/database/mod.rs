use crate::{
    account::Account, backup::LoadedBackup, database::open_snapshot, errors::BackupError,
    manifest::find_files,
};
use rusqlite::Connection;

#[cfg(test)]
mod tests;

// Owned connections are retained for subsequent query commands and dropped
// together on unload, failed load, or a superseding load.
pub(crate) struct AccountDatabases {
    pub(crate) account: Account,
    pub(crate) session: Connection,
    pub(crate) contact: Connection,
    #[allow(dead_code)] // Message queries are the next migration step.
    pub(crate) message: Vec<Connection>,
}

pub(crate) fn load_account_databases(
    backup: &LoadedBackup,
    account_id: &str,
    check_cancelled: impl Fn() -> Result<(), BackupError>,
) -> Result<AccountDatabases, BackupError> {
    check_cancelled()?;
    let account = backup
        .accounts
        .iter()
        .find(|account| account.id.as_deref() == Some(account_id))
        .cloned()
        .ok_or_else(|| BackupError::new("Error", "Account not found"))?;
    check_cancelled()?;
    let directory = &backup.directory;
    let manifest = backup
        .manifest
        .lock()
        .map_err(|error| BackupError::context("备份状态不可用", error))?;
    let prefix = format!("Documents/{:x}", md5::compute(account_id.as_bytes()));
    let open_required = |relative_path: &str| -> Result<Connection, BackupError> {
        check_cancelled()?;
        let files = find_files(&manifest, directory, relative_path)?;
        let file = files.first().ok_or_else(|| {
            BackupError::invalid(format!("Backup database was not found: {relative_path}"))
        })?;
        let database = open_snapshot(file.read(backup.encryption.as_ref(), &check_cancelled)?)?;
        check_cancelled()?;
        Ok(database)
    };
    let session = open_required(&format!("{prefix}/session/session.db"))?;
    let contact = open_required(&format!("{prefix}/DB/WCDB_Contact.sqlite"))?;
    let mut message = Vec::new();
    for file in find_files(
        &manifest,
        directory,
        &format!("{prefix}/DB/message_%.sqlite"),
    )? {
        check_cancelled()?;
        message.push(open_snapshot(
            file.read(backup.encryption.as_ref(), &check_cancelled)?,
        )?);
    }
    check_cancelled()?;
    Ok(AccountDatabases {
        account,
        session,
        contact,
        message,
    })
}
