use super::{
    source,
    store::{Hit, Store},
    text::{self, Query},
    Request,
};
use crate::{errors::BackupError, state::BackupState};
use serde::Serialize;
use std::sync::{Arc, Condvar, Mutex, MutexGuard};

#[derive(Serialize)]
#[serde(tag = "phase", rename_all = "lowercase")]
pub(crate) enum Status {
    Idle,
    Building {
        #[serde(rename = "indexedMessageCount")]
        indexed_message_count: usize,
    },
    Ready {
        #[serde(rename = "indexedMessageCount")]
        indexed_message_count: usize,
    },
    Failed {
        #[serde(rename = "errorMessage")]
        error_message: String,
    },
}

enum Phase {
    Building,
    Ready(Arc<Mutex<Store>>),
    Failed(BackupError),
    Cancelled,
}
struct Inner {
    phase: Phase,
    count: usize,
}

pub(crate) struct Session {
    pub(crate) generation: u64,
    inner: Mutex<Inner>,
    completed: Condvar,
}

impl Session {
    pub(crate) fn new(generation: u64) -> Self {
        Self {
            generation,
            inner: Mutex::new(Inner {
                phase: Phase::Building,
                count: 0,
            }),
            completed: Condvar::new(),
        }
    }

    fn lock(&self) -> Result<MutexGuard<'_, Inner>, BackupError> {
        self.inner
            .lock()
            .map_err(|e| BackupError::context("Message search state is unavailable", e))
    }

    pub(crate) fn status(&self) -> Result<Status, BackupError> {
        let inner = self.lock()?;
        Ok(match &inner.phase {
            Phase::Building => Status::Building {
                indexed_message_count: inner.count,
            },
            Phase::Ready(_) => Status::Ready {
                indexed_message_count: inner.count,
            },
            Phase::Failed(error) => Status::Failed {
                error_message: error.to_string(),
            },
            Phase::Cancelled => Status::Idle,
        })
    }

    pub(crate) fn cancel(&self) -> Result<(), BackupError> {
        self.lock()?.phase = Phase::Cancelled;
        self.completed.notify_all();
        Ok(())
    }

    fn progress(&self, count: usize) -> Result<(), BackupError> {
        let mut inner = self.lock()?;
        if matches!(inner.phase, Phase::Cancelled) {
            return Err(cancelled());
        }
        inner.count = count;
        Ok(())
    }

    fn build_store(&self, state: &BackupState) -> Result<Store, BackupError> {
        let tables = state.with_search_account(self.generation, source::tables)?;
        let store = Store::new()?;
        let mut count = 0;
        for table in tables {
            let mut after = None;
            loop {
                let batch = state.with_search_account(self.generation, |databases| {
                    source::read(databases, &table, after)
                })?;
                for document in batch.documents {
                    let tokens = text::tokenize(&document.message_plain_text);
                    if tokens.is_empty() {
                        continue;
                    }
                    count += 1;
                    store.insert(count, &document, &tokens)?;
                }
                self.progress(count)?;
                let Some(last_row) = batch.last_row else {
                    break;
                };
                after = Some(last_row);
            }
        }
        self.progress(count)?;
        store.commit()?;
        Ok(store)
    }

    pub(crate) fn build(&self, state: &BackupState) -> Result<(), BackupError> {
        let result = self.build_store(state);
        let mut inner = self.lock()?;
        if !matches!(inner.phase, Phase::Cancelled) {
            inner.phase = match result {
                Ok(store) => Phase::Ready(Arc::new(Mutex::new(store))),
                Err(error) => Phase::Failed(error),
            };
        }
        self.completed.notify_all();
        Ok(())
    }

    pub(super) fn search(
        &self,
        state: &BackupState,
        request: &Request,
    ) -> Result<(Vec<Hit>, usize), BackupError> {
        let mut inner = self.lock()?;
        // Like ensureQueryData, a new search retries a failed build. Concurrent
        // searches share that retry and observe its result rather than rebuilding.
        if matches!(inner.phase, Phase::Failed(_)) {
            inner.phase = Phase::Building;
            inner.count = 0;
            drop(inner);
            self.build(state)?;
            inner = self.lock()?;
        }
        while matches!(inner.phase, Phase::Building) {
            inner = self
                .completed
                .wait(inner)
                .map_err(|e| BackupError::context("Cannot wait for message search index", e))?;
        }
        let store = match &inner.phase {
            Phase::Ready(store) => store.clone(),
            Phase::Failed(error) => return Err(error.clone()),
            Phase::Cancelled => return Err(cancelled()),
            Phase::Building => unreachable!(),
        };
        // SQL owns only the index connection lock. Status and account disposal
        // remain available while a search is running.
        drop(inner);
        let Some(query) = Query::new(request.search_text.as_deref().unwrap_or_default()) else {
            return Ok((Vec::new(), 0));
        };
        let store = store
            .lock()
            .map_err(|e| BackupError::context("Message search database is unavailable", e))?;
        store.search(request, &query)
    }
}

fn cancelled() -> BackupError {
    BackupError::new("AbortError", "Message search account is no longer loaded")
}
