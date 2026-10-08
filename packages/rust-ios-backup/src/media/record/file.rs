use super::RecordFileRequest;
use crate::{
    backup::LoadedBackup,
    errors::BackupError,
    file::{prepare_attachment, FileSource, Registry},
    manifest::find_file,
    media::{files, Response},
};
use std::sync::Arc;

pub(crate) async fn get(
    backup: Arc<LoadedBackup>,
    registry: Arc<Registry>,
    request: RecordFileRequest,
) -> Result<Response<Option<FileSource>>, BackupError> {
    let lookup_backup = backup.clone();
    let path = tauri::async_runtime::spawn_blocking(move || {
        for path in files(
            &lookup_backup,
            &request.account.id,
            &request.chat.id,
            &format!(
                "{}/{}.{}",
                request.message.local_id, request.record.data_id, request.record.datafmt
            ),
            "OpenData",
        )? {
            if find_file(&lookup_backup, &path)?.path.is_file() {
                return Ok(Some(path));
            }
        }
        Ok::<_, BackupError>(None)
    })
    .await
    .map_err(|error| BackupError::context("读取记录文件失败", error))??;
    let data = match path {
        Some(path) => Some(prepare_attachment(backup, registry, path).await?),
        None => None,
    };
    Ok(Response { data })
}
