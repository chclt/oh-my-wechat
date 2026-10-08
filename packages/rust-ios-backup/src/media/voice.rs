use super::{file, files, Identifier, Message, Response};
use crate::{backup::LoadedBackup, errors::BackupError, manifest::find_file};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub(crate) struct VoiceRequest {
    account: Identifier,
    chat: Identifier,
    message: Message,
    // The web implementation currently reads both voice and transcription,
    // regardless of include. Keep that behavior.
}

#[derive(Default, Serialize)]
pub(crate) struct VoiceInfo {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) uri: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) transcription: Option<Option<String>>,
}

pub(crate) fn get(
    backup: &LoadedBackup,
    request: VoiceRequest,
) -> Result<Response<Option<VoiceInfo>>, BackupError> {
    let paths = files(
        backup,
        &request.account.id,
        &request.chat.id,
        &format!("{}.%", request.message.local_id),
        "Audio",
    )?;
    if paths.is_empty() {
        return Ok(Response { data: None });
    }
    let mut result = VoiceInfo::default();
    for path in paths {
        if path.ends_with(".aud") {
            result.uri = Some(file(&path).uri);
        }
        if path.ends_with(".txt") {
            let file = find_file(backup, &path)?;
            result.transcription = Some(None);
            if file.path.is_file() {
                let bytes = file.read(backup.encryption.as_ref(), &|| Ok(()))?;
                result.transcription = Some(Some(
                    String::from_utf8_lossy(
                        bytes.strip_prefix(&[0xef, 0xbb, 0xbf]).unwrap_or(&bytes),
                    )
                    .into_owned(),
                ));
            }
        }
    }
    Ok(Response { data: Some(result) })
}
