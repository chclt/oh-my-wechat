use super::RecordRequest;
use crate::{
    backup::LoadedBackup,
    errors::BackupError,
    media::{file, files, Response, VideoInfo},
};

pub(crate) fn get(
    backup: &LoadedBackup,
    request: RecordRequest,
) -> Result<Response<VideoInfo>, BackupError> {
    let paths = files(
        backup,
        &request.account.id,
        &request.chat.id,
        &format!("{}/{}.%", request.message.local_id, request.record.data_id),
        "OpenData",
    )?;
    let mut result = VideoInfo::default();
    for path in paths {
        if path.ends_with(".mp4") {
            result.uri = file(&path).uri;
        } else if path.ends_with(".record_thumb") {
            result.cover = Some(file(&path));
        }
    }
    Ok(Response { data: result })
}
