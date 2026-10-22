use super::RecordFileRequest;
use crate::{
    backup::LoadedBackup,
    errors::BackupError,
    manifest::find_file,
    media::{file, files, MediaFile, Response},
};
use std::sync::Arc;

pub(crate) async fn get(
    backup: Arc<LoadedBackup>,
    request: RecordFileRequest,
) -> Result<Response<Option<MediaFile>>, BackupError> {
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
    let data = path.as_deref().map(file);
    Ok(Response { data })
}
