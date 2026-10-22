use super::{directory, ResolvedFile};
use crate::errors::BackupError;
use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc, Mutex,
    },
};
use tokio::sync::OnceCell;

pub(super) struct Entry {
    pub result: OnceCell<Result<Arc<ResolvedFile>, BackupError>>,
    references: AtomicUsize,
}

impl Entry {
    pub fn active(&self) -> bool {
        self.references.load(Ordering::Acquire) > 0
    }
}

#[derive(Default)]
struct Resources {
    entries: HashMap<String, Arc<Entry>>,
    references: HashMap<String, (String, Arc<Entry>)>,
    closed: bool,
}

#[derive(Default)]
pub(crate) struct Registry {
    resources: Mutex<Resources>,
}

impl Registry {
    pub(super) fn acquire(
        &self,
        uri: &str,
        reference_id: String,
    ) -> Result<Arc<Entry>, BackupError> {
        let mut resources = self.resources.lock().unwrap();
        if resources.closed {
            return Err(BackupError::new("AbortError", "File session was closed"));
        }
        let entry = resources
            .entries
            .entry(uri.to_owned())
            .or_insert_with(|| {
                Arc::new(Entry {
                    result: OnceCell::new(),
                    references: AtomicUsize::new(0),
                })
            })
            .clone();
        entry.references.fetch_add(1, Ordering::Release);
        resources
            .references
            .insert(reference_id, (uri.to_owned(), entry.clone()));
        Ok(entry)
    }

    // A URL grants access only while its acquisition is still in this registry.
    pub(super) fn resolved(&self, reference_id: &str) -> Option<Arc<ResolvedFile>> {
        let resources = self.resources.lock().unwrap();
        if resources.closed {
            return None;
        }
        let (_, entry) = resources.references.get(reference_id)?;
        entry.result.get()?.as_ref().ok().cloned()
    }

    pub(crate) fn release(&self, reference_id: &str) {
        let mut resources = self.resources.lock().unwrap();
        let Some((uri, entry)) = resources.references.remove(reference_id) else {
            return;
        };
        if entry.references.fetch_sub(1, Ordering::AcqRel) == 1
            && resources
                .entries
                .get(&uri)
                .is_some_and(|current| Arc::ptr_eq(current, &entry))
        {
            resources.entries.remove(&uri);
        }
    }

    pub(super) fn failed(&self, uri: &str, entry: &Arc<Entry>) {
        let mut resources = self.resources.lock().unwrap();
        if resources
            .entries
            .get(uri)
            .is_some_and(|current| Arc::ptr_eq(current, entry))
        {
            resources.entries.remove(uri);
        }
    }

    pub(super) fn directory(
        &self,
        store: &directory::Store,
        relative_path: &str,
    ) -> Result<directory::FileDirectory, BackupError> {
        let resources = self.resources.lock().unwrap();
        if resources.closed {
            return Err(BackupError::new("AbortError", "File session was closed"));
        }
        store
            .file(relative_path)
            .map_err(|error| BackupError::context("Cannot create media file directory", error))
    }

    pub(super) fn is_open(&self) -> bool {
        !self.resources.lock().unwrap().closed
    }

    pub(crate) fn clear(&self) {
        let mut resources = self.resources.lock().unwrap();
        resources.closed = true;
        for entry in resources.entries.values() {
            entry.references.store(0, Ordering::Release);
        }
        resources.references.clear();
        resources.entries.clear();
    }
}
