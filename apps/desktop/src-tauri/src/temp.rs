use std::{
    fs::{self, File, OpenOptions, TryLockError},
    io,
    path::{Path, PathBuf},
};
use tempfile::TempDir;

const INSTANCE_PREFIX: &str = "instance-";
const INSTANCE_RANDOM_BYTES: usize = 16;
const INSTANCE_LOCK: &str = ".instance.lock";

/// Owns this application process's temporary directory and live-instance lock.
pub(crate) struct Instance {
    root: PathBuf,
    directory: Option<TempDir>,
    lease: Option<File>,
}

impl Instance {
    pub(crate) fn new(root: PathBuf) -> io::Result<Self> {
        private_directory(&root)?;
        // Collection and creation are serialized so an incomplete new instance
        // cannot be mistaken for a crashed instance without a lease file.
        let _guard = lock_root(&root)?;
        for entry in fs::read_dir(&root)? {
            let entry = match entry {
                Ok(entry) => entry,
                Err(error) => {
                    eprintln!("Cannot inspect temporary directory: {error}");
                    continue;
                }
            };
            let name = entry.file_name();
            let Some(name) = name.to_str() else {
                continue;
            };
            let Some(suffix) = name.strip_prefix(INSTANCE_PREFIX) else {
                continue;
            };
            if suffix.len() != INSTANCE_RANDOM_BYTES
                || !suffix.bytes().all(|byte| byte.is_ascii_alphanumeric())
            {
                continue;
            }
            if let Err(error) = collect(&entry.path()) {
                eprintln!(
                    "Cannot clean temporary directory {}: {error}",
                    entry.path().display()
                );
            }
        }
        let mut builder = tempfile::Builder::new();
        builder
            .prefix(INSTANCE_PREFIX)
            .rand_bytes(INSTANCE_RANDOM_BYTES);
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            builder.permissions(fs::Permissions::from_mode(0o700));
        }
        let directory = builder.tempdir_in(&root)?;
        let lease = OpenOptions::new()
            .read(true)
            .write(true)
            .create_new(true)
            .open(directory.path().join(INSTANCE_LOCK))?;
        lease.lock()?;
        Ok(Self {
            root,
            directory: Some(directory),
            lease: Some(lease),
        })
    }

    pub(crate) fn path(&self) -> &Path {
        self.directory.as_ref().unwrap().path()
    }
}

impl Drop for Instance {
    fn drop(&mut self) {
        let _guard = match lock_root(&self.root) {
            Ok(guard) => guard,
            Err(error) => {
                eprintln!("Cannot lock temporary directory cleanup: {error}");
                // Leave the directory for a later startup instead of racing a collector.
                if let Some(directory) = self.directory.take() {
                    let _ = directory.keep();
                }
                return;
            }
        };
        // Windows requires the lease file to be closed before removing it.
        drop(self.lease.take());
        if let Some(directory) = self.directory.take() {
            let path = directory.path().to_owned();
            if let Err(error) = directory.close() {
                if error.kind() != io::ErrorKind::NotFound {
                    eprintln!(
                        "Cannot remove application temporary directory {}: {error}",
                        path.display()
                    );
                }
            }
        }
    }
}

fn lock_root(root: &Path) -> io::Result<File> {
    let file = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .truncate(false)
        .open(root.join(".cleanup.lock"))?;
    file.lock()?;
    Ok(file)
}

fn collect(path: &Path) -> io::Result<()> {
    if !fs::symlink_metadata(path)?.file_type().is_dir() {
        return Ok(());
    }
    let lock_path = path.join(INSTANCE_LOCK);
    match fs::symlink_metadata(&lock_path) {
        Ok(metadata) if metadata.file_type().is_file() => {
            let lease = OpenOptions::new().read(true).write(true).open(&lock_path)?;
            match lease.try_lock() {
                Ok(()) => {}
                Err(TryLockError::WouldBlock) => return Ok(()),
                Err(TryLockError::Error(error)) => return Err(error),
            }
            // The root lock excludes creators and collectors until removal completes.
            drop(lease);
        }
        Err(error) if error.kind() == io::ErrorKind::NotFound => {}
        Err(error) => return Err(error),
        Ok(_) => return Ok(()),
    }
    fs::remove_dir_all(path)
}

fn private_directory(path: &Path) -> io::Result<()> {
    let builder = fs::DirBuilder::new();
    #[cfg(unix)]
    let builder = {
        use std::os::unix::fs::DirBuilderExt;
        let mut builder = builder;
        builder.mode(0o700);
        builder
    };
    match builder.create(path) {
        Ok(()) => {}
        Err(error) if error.kind() == io::ErrorKind::AlreadyExists => {}
        Err(error) => return Err(error),
    }
    let metadata = fs::symlink_metadata(path)?;
    if !metadata.file_type().is_dir() {
        return Err(io::Error::other(
            "Temporary directory is not a real directory",
        ));
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if metadata.permissions().mode() & 0o077 != 0 {
            return Err(io::Error::new(
                io::ErrorKind::PermissionDenied,
                "Temporary directory must be private to the current user",
            ));
        }
    }
    Ok(())
}
