use super::{files, Identifier, Message, Response};
use crate::{
    backup::LoadedBackup,
    errors::BackupError,
    file::{prepare_attachment, FileSource, Registry},
    manifest::find_file,
};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Deserialize)]
pub(crate) struct AttachRequest {
    account: Identifier,
    chat: Identifier,
    message: Message,
}

pub(crate) async fn get(
    backup: Arc<LoadedBackup>,
    registry: Arc<Registry>,
    request: AttachRequest,
) -> Result<Response<Option<FileSource>>, BackupError> {
    let lookup_backup = backup.clone();
    let path = tauri::async_runtime::spawn_blocking(move || {
        // Unlike image/video metadata, the web attachment endpoint skips missing files.
        for path in files(
            &lookup_backup,
            &request.account.id,
            &request.chat.id,
            &format!("{}.%", request.message.local_id),
            "OpenData",
        )? {
            if find_file(&lookup_backup, &path)?.path.is_file() {
                return Ok(Some(path));
            }
        }
        Ok::<_, BackupError>(None)
    })
    .await
    .map_err(|error| BackupError::context("读取附件失败", error))??;
    let data = match path {
        Some(path) => Some(prepare_attachment(backup, registry, path).await?),
        None => None,
    };
    Ok(Response { data })
}
