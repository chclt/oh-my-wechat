mod ffmpeg;
mod registry;
mod silk;
mod speex;
mod wxgf;

use crate::{backup::LoadedBackup, errors::BackupError, manifest::find_file};
pub(crate) use registry::Registry;
use std::{
    fs,
    io::Read,
    path::{Path, PathBuf},
    sync::Arc,
};
use tempfile::TempDir;
use tokio::sync::Semaphore;

// Acquire before reading/decrypting input so queued jobs do not hold whole files.
static QUEUE: Semaphore = Semaphore::const_new(1);

pub(crate) struct ResolvedFile {
    pub path: PathBuf,
    // The last reference removes generated files, never original backup files.
    _directory: Option<TempDir>,
}

#[derive(serde::Serialize)]
pub(crate) struct FileSource {
    pub src: PathBuf,
}

pub(crate) fn resolve(
    backup: Arc<LoadedBackup>,
    registry: Arc<Registry>,
    uri: String,
    reference_id: String,
) -> Result<
    impl std::future::Future<Output = Result<Arc<ResolvedFile>, BackupError>> + Send + 'static,
    BackupError,
> {
    let path = uri
        .strip_prefix("ios-backup:")
        .ok_or_else(|| BackupError::new("Error", format!("[messageFile] unsupported uri: {uri}")))?
        .to_owned();
    let entry = registry.acquire(&uri, reference_id.clone())?;
    // Register synchronously at IPC dispatch; only file work runs asynchronously.
    Ok(async move {
        let result = entry
            .result
            .get_or_init(|| async {
                prepare(backup, registry.clone(), path, true, || entry.active()).await
            })
            .await
            .clone();
        if result.is_err() {
            registry.failed(&uri, &entry);
            registry.release(&reference_id);
        }
        result
    })
}

pub(crate) async fn prepare_attachment(
    backup: Arc<LoadedBackup>,
    registry: Arc<Registry>,
    path: String,
) -> Result<FileSource, BackupError> {
    let file = prepare(backup, registry.clone(), path, false, || true).await?;
    let src = file.path.clone();
    registry.retain_attachment(file)?;
    Ok(FileSource { src })
}

async fn prepare(
    backup: Arc<LoadedBackup>,
    registry: Arc<Registry>,
    path: String,
    convert: bool,
    active: impl Fn() -> bool + Send + Sync,
) -> Result<Arc<ResolvedFile>, BackupError> {
    let lookup_backup = backup.clone();
    let lookup_path = path.clone();
    let (file, transformed) = tauri::async_runtime::spawn_blocking(move || {
        let file = find_file(&lookup_backup, &lookup_path)?;
        let audio = convert && (lookup_path.ends_with(".aud") || lookup_path.ends_with(".speex"));
        let mut transformed = audio || lookup_backup.encryption.is_some();
        if !transformed && convert {
            let mut header = [0; 4];
            let mut source = fs::File::open(&file.path)
                .map_err(|error| BackupError::context("Cannot open media file", error))?;
            let length = source
                .read(&mut header)
                .map_err(|error| BackupError::context("Cannot read media header", error))?;
            transformed = wxgf::is_wxgf(&header[..length]);
        }
        Ok::<_, BackupError>((file, transformed))
    })
    .await
    .map_err(|error| BackupError::context("Cannot inspect media file", error))??;
    if !transformed {
        return Ok(Arc::new(ResolvedFile {
            path: file.path,
            _directory: None,
        }));
    }
    let permit = QUEUE.acquire().await.unwrap();
    if !active() || !registry.is_open() {
        return Err(BackupError::new(
            "AbortError",
            "File was released before loading",
        ));
    }
    let result = tauri::async_runtime::spawn_blocking(move || {
        let directory = registry.directory()?;
        let bytes = file.read(backup.encryption.as_ref(), &|| Ok(()))?;
        let output = if convert && path.ends_with(".aud") {
            silk::convert(&bytes, directory.path(), &ffmpeg::executable()?)?
        } else if convert && path.ends_with(".speex") {
            speex::convert(&bytes, directory.path(), &ffmpeg::executable()?)?
        } else if convert && wxgf::is_wxgf(&bytes) {
            wxgf::convert(&bytes, directory.path(), &ffmpeg::executable()?)?
        } else {
            let output = directory.path().join(Path::new(&path).file_name().unwrap());
            fs::write(&output, bytes)
                .map_err(|error| BackupError::context("Cannot write decrypted media", error))?;
            output
        };
        Ok(Arc::new(ResolvedFile {
            path: output,
            _directory: Some(directory),
        }))
    })
    .await
    .map_err(|error| BackupError::context("Cannot process media", error))?;
    drop(permit);
    result
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ResolveRequest {
    pub uri: String,
    pub reference_id: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ReleaseRequest {
    pub reference_id: String,
}

pub(crate) fn finish_pending() {
    tauri::async_runtime::block_on(async {
        let _permit = QUEUE.acquire().await.unwrap();
    });
}
