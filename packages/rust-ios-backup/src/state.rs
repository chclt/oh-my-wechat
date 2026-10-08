use crate::{
    account::database::AccountDatabases,
    account::{Account, AccountList},
    backup::LoadedBackup,
    errors::BackupError,
    file::Registry,
    message::search,
};
use std::sync::{Arc, Mutex, MutexGuard};

#[derive(Default)]
struct Session {
    backup: Option<Arc<LoadedBackup>>,
    generation: u64,
    loaded: Option<AccountDatabases>,
    search: Option<Arc<search::Session>>,
    files: Arc<Registry>,
}

#[derive(Clone, Default)]
pub struct BackupState {
    session: Arc<Mutex<Session>>,
}

impl BackupState {
    pub(crate) fn files(&self) -> Result<(Arc<LoadedBackup>, Arc<Registry>), BackupError> {
        let session = self.lock()?;
        let backup = session
            .backup
            .clone()
            .ok_or_else(|| BackupError::new("Error", "Directory not loaded"))?;
        Ok((backup, session.files.clone()))
    }

    pub(crate) fn file_registry(&self) -> Result<Arc<Registry>, BackupError> {
        Ok(self.lock()?.files.clone())
    }

    pub(crate) fn release_file(&self, reference_id: &str) -> Result<(), BackupError> {
        self.file_registry()?.release(reference_id);
        Ok(())
    }

    pub(crate) fn with_account<T>(
        &self,
        account_id: &str,
        query: impl FnOnce(&AccountDatabases) -> Result<T, BackupError>,
    ) -> Result<T, BackupError> {
        let session = self.lock()?;
        let loaded = session
            .loaded
            .as_ref()
            .filter(|loaded| loaded.account.id.as_deref() == Some(account_id))
            .ok_or_else(|| {
                BackupError::new("AccountNotLoadedError", "Account database is not loaded")
            })?;
        query(loaded)
    }

    pub(crate) fn search_session(
        &self,
        account_id: &str,
    ) -> Result<Option<Arc<search::Session>>, BackupError> {
        let session = self.lock()?;
        Ok(
            if session
                .loaded
                .as_ref()
                .is_some_and(|databases| databases.account.id.as_deref() == Some(account_id))
            {
                session.search.clone()
            } else {
                None
            },
        )
    }

    pub(crate) fn with_search_account<T>(
        &self,
        generation: u64,
        query: impl FnOnce(&AccountDatabases) -> Result<T, BackupError>,
    ) -> Result<T, BackupError> {
        let session = self.lock()?;
        if session.generation != generation {
            return Err(cancelled());
        }
        query(
            session
                .loaded
                .as_ref()
                .expect("search session has a loaded account"),
        )
    }

    fn lock(&self) -> Result<MutexGuard<'_, Session>, BackupError> {
        self.session
            .lock()
            .map_err(|error| BackupError::context("备份状态不可用", error))
    }

    pub(crate) fn begin_directory_load(&self) -> Result<u64, BackupError> {
        let mut session = self.lock()?;
        session.files.clear();
        session.files = Arc::new(Registry::default());
        session.generation += 1;
        if let Some(search) = session.search.take() {
            search.cancel()?;
        }
        session.loaded = None;
        session.backup = None;
        Ok(session.generation)
    }

    pub(crate) fn finish_directory_load(
        &self,
        generation: u64,
        backup: LoadedBackup,
    ) -> Result<(), BackupError> {
        let mut session = self.lock()?;
        if session.generation != generation {
            return Err(cancelled());
        }
        session.backup = Some(Arc::new(backup));
        Ok(())
    }

    pub(crate) fn account_list(&self) -> Result<AccountList, BackupError> {
        let session = self.lock()?;
        let backup = session
            .backup
            .as_ref()
            .ok_or_else(|| BackupError::new("Error", "Directory not loaded"))?;
        Ok(AccountList {
            data: backup.accounts.clone(),
        })
    }

    pub(crate) fn account(&self, account_id: &str) -> Result<Account, BackupError> {
        self.account_list()?
            .data
            .into_iter()
            .find(|account| account.id.as_deref() == Some(account_id))
            .ok_or_else(|| BackupError::new("Error", "Account not found"))
    }

    pub(crate) fn begin_account_load(&self) -> Result<(Arc<LoadedBackup>, u64), BackupError> {
        let mut session = self.lock()?;
        let backup = session
            .backup
            .clone()
            .ok_or_else(|| BackupError::new("Error", "Directory not loaded"))?;
        session.files.clear();
        session.files = Arc::new(Registry::default());
        session.generation += 1;
        if let Some(search) = session.search.take() {
            search.cancel()?;
        }
        session.loaded = None;
        Ok((backup, session.generation))
    }

    pub(crate) fn check_current(&self, generation: u64) -> Result<(), BackupError> {
        if self.lock()?.generation != generation {
            return Err(cancelled());
        }
        Ok(())
    }

    pub(crate) fn finish_account_load(
        &self,
        generation: u64,
        databases: AccountDatabases,
    ) -> Result<(), BackupError> {
        let mut session = self.lock()?;
        if session.generation != generation {
            return Err(cancelled());
        }
        let search = Arc::new(search::Session::new(generation));
        session.loaded = Some(databases);
        session.search = Some(search.clone());
        drop(session);
        let state = self.clone();
        tauri::async_runtime::spawn_blocking(move || {
            if let Err(error) = search.build(&state) {
                eprintln!("Cannot update message search state: {error}");
            }
        });
        Ok(())
    }

    pub(crate) fn unload_account(&self) -> Result<(), BackupError> {
        let mut session = self.lock()?;
        session.files.clear();
        session.files = Arc::new(Registry::default());
        session.generation += 1;
        if let Some(search) = session.search.take() {
            search.cancel()?;
        }
        session.loaded = None;
        Ok(())
    }
}

fn cancelled() -> BackupError {
    BackupError::new("AbortError", "Account loading was cancelled")
}
