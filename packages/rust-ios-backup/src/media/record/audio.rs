use super::RecordFileRequest;
use crate::{
    backup::LoadedBackup,
    errors::BackupError,
    media::{file, files, Response, VoiceInfo},
};

pub(crate) fn get(
    backup: &LoadedBackup,
    request: RecordFileRequest,
) -> Result<Response<Option<VoiceInfo>>, BackupError> {
    let paths = files(
        backup,
        &request.account.id,
        &request.chat.id,
        &format!(
            "{}/{}.{}",
            request.message.local_id, request.record.data_id, request.record.datafmt
        ),
        "OpenData",
    )?;
    let data = paths.first().map(|path| VoiceInfo {
        uri: Some(file(path).uri),
        ..VoiceInfo::default()
    });
    Ok(Response { data })
}
