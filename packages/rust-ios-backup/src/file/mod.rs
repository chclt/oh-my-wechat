mod directory;
mod ffmpeg;
#[cfg(target_os = "linux")]
mod mp4;
pub(crate) mod protocol;
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
use tauri::Manager;
use tokio::sync::Semaphore;

// Acquire before reading/decrypting input so queued jobs do not hold whole files.
static QUEUE: Semaphore = Semaphore::const_new(1);

pub(crate) struct ResolvedFile {
    pub path: PathBuf,
    // The last reference removes generated files, never original backup files.
    _directory: Option<directory::FileDirectory>,
}

pub(crate) fn initialize<R: tauri::Runtime>(app: &tauri::AppHandle<R>, root: PathBuf) {
    app.manage(directory::Store::new(root));
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ResolvedFileSource {
    pub src: String,
    pub mime_type: String,
}

impl ResolvedFile {
    pub(crate) fn source(&self, reference_id: &str) -> Result<ResolvedFileSource, BackupError> {
        // Use the same MIME detection as Tauri's asset protocol. Backup filenames
        // can be hashes, and converted audio no longer has its original format.
        let mut header = Vec::new();
        fs::File::open(&self.path)
            .and_then(|file| file.take(8192).read_to_end(&mut header))
            .map_err(|error| BackupError::context("Cannot read media header", error))?;
        Ok(ResolvedFileSource {
            src: reference_id
                .as_bytes()
                .iter()
                .map(|byte| format!("{byte:02x}"))
                .collect(),
            mime_type: tauri::utils::mime_type::MimeType::parse(
                &header,
                &self.path.to_string_lossy(),
            ),
        })
    }
}

pub(crate) fn resolve<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    backup: Arc<LoadedBackup>,
    registry: Arc<Registry>,
    uri: String,
    reference_id: String,
    raw: bool,
) -> Result<
    impl std::future::Future<Output = Result<Arc<ResolvedFile>, BackupError>> + Send + 'static,
    BackupError,
> {
    let path = uri
        .strip_prefix("ios-backup:")
        .ok_or_else(|| BackupError::new("Error", format!("[messageFile] unsupported uri: {uri}")))?
        .to_owned();
    let ffmpeg = if raw {
        None
    } else {
        Some(ffmpeg::executable(app)?)
    };
    let key = format!("{}:{uri}", if raw { "raw" } else { "converted" });
    let directories = app.state::<directory::Store>().inner().clone();
    let entry = registry.acquire(&key, reference_id.clone())?;
    // Register synchronously at IPC dispatch; only file work runs asynchronously.
    Ok(async move {
        let result = entry
            .result
            .get_or_init(|| async {
                prepare(backup, registry.clone(), directories, path, ffmpeg, || {
                    entry.active()
                })
                .await
            })
            .await
            .clone();
        if result.is_err() {
            registry.failed(&key, &entry);
            registry.release(&reference_id);
        }
        result
    })
}

async fn prepare(
    backup: Arc<LoadedBackup>,
    registry: Arc<Registry>,
    directories: directory::Store,
    path: String,
    ffmpeg: Option<PathBuf>,
    active: impl Fn() -> bool + Send + Sync,
) -> Result<Arc<ResolvedFile>, BackupError> {
    let lookup_backup = backup.clone();
    let lookup_path = path.clone();
    let convert = ffmpeg.is_some();
    let (file, transformed) = tauri::async_runtime::spawn_blocking(move || {
        let file = find_file(&lookup_backup, &lookup_path)?;
        let audio = convert && (lookup_path.ends_with(".aud") || lookup_path.ends_with(".speex"));
        let video = convert && cfg!(target_os = "linux") && lookup_path.ends_with(".mp4");
        let mut transformed = audio || video || lookup_backup.encryption.is_some();
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
        let directory = registry.directory(&directories, &path)?;
        let bytes = file.read(backup.encryption.as_ref(), &|| Ok(()))?;
        let output = match ffmpeg.as_deref() {
            #[cfg(target_os = "linux")]
            Some(ffmpeg) if path.ends_with(".mp4") => mp4::remux(&bytes, directory.path(), ffmpeg)?,
            Some(ffmpeg) if path.ends_with(".aud") => {
                silk::convert(&bytes, directory.path(), ffmpeg)?
            }
            Some(ffmpeg) if path.ends_with(".speex") => {
                speex::convert(&bytes, directory.path(), ffmpeg)?
            }
            Some(ffmpeg) if wxgf::is_wxgf(&bytes) => {
                wxgf::convert(&bytes, directory.path(), ffmpeg)?
            }
            _ => {
                let output = directory.path().join(Path::new(&path).file_name().unwrap());
                fs::write(&output, bytes)
                    .map_err(|error| BackupError::context("Cannot write decrypted media", error))?;
                output
            }
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
    #[serde(default)]
    pub raw: bool,
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
