use super::RecordRequest;
use crate::{
    backup::LoadedBackup,
    errors::BackupError,
    media::{file, files, ImageInfo, Response},
};

pub(crate) fn get(
    backup: &LoadedBackup,
    request: RecordRequest,
) -> Result<Response<ImageInfo>, BackupError> {
    let paths = files(
        backup,
        &request.account.id,
        &request.chat.id,
        &format!("{}/{}.%", request.message.local_id, request.record.data_id),
        "OpenData",
    )?;
    let mut result = ImageInfo::default();
    for path in paths {
        if path.ends_with(".record_dat") {
            result.regular = Some(file(&path));
        } else if path.ends_with(".record_thumb") {
            result.thumbnail = Some(file(&path));
        }
    }
    Ok(Response { data: result })
}
