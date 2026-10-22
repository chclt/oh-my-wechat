use std::{
    fs, io,
    path::{Path, PathBuf},
};
use tempfile::TempDir;

#[derive(Clone)]
pub(super) struct Store {
    root: PathBuf,
}

impl Store {
    // The desktop host prepares and owns this instance directory.
    pub(super) fn new(root: PathBuf) -> Self {
        Self { root }
    }

    pub(super) fn file(&self, relative_path: &str) -> io::Result<FileDirectory> {
        let parent = self.root.join(account_directory(relative_path));
        fs::create_dir_all(&parent)?;
        let directory = tempfile::Builder::new()
            .prefix("file-")
            .tempdir_in(parent)?;
        Ok(FileDirectory {
            directory: Some(directory),
        })
    }
}

// Each file owns only its unique directory. Old and new backup sessions may
// share an account directory, so releasing a file never removes its parent.
pub(super) struct FileDirectory {
    directory: Option<TempDir>,
}

impl FileDirectory {
    pub(super) fn path(&self) -> &Path {
        self.directory.as_ref().unwrap().path()
    }
}

impl Drop for FileDirectory {
    fn drop(&mut self) {
        if let Some(directory) = self.directory.take() {
            let path = directory.path().to_owned();
            if let Err(error) = directory.close() {
                if error.kind() != io::ErrorKind::NotFound {
                    eprintln!("Cannot remove media directory {}: {error}", path.display());
                }
            }
        }
    }
}

fn account_directory(relative_path: &str) -> &str {
    let mut components = relative_path.split('/');
    if components.next() == Some("Documents") {
        if let Some(hash) = components.next() {
            if hash.len() == 32 && hash.bytes().all(|byte| byte.is_ascii_hexdigit()) {
                return hash;
            }
        }
    }
    // Backup-level resources may be requested before an account is selected.
    "shared"
}
