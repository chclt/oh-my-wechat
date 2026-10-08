use super::{dimension, file, files, Identifier, MediaFile, Message, Response};
use crate::{backup::LoadedBackup, errors::BackupError};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
enum Include {
    Video,
    Cover,
}

#[derive(Deserialize)]
pub(crate) struct VideoRequest {
    account: Identifier,
    chat: Identifier,
    message: Message,
    include: Option<Vec<Include>>,
}

#[derive(Default, Serialize)]
pub(crate) struct VideoInfo {
    pub(super) uri: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) cover: Option<MediaFile>,
}

pub(crate) fn get(
    backup: &LoadedBackup,
    request: VideoRequest,
) -> Result<Response<Option<VideoInfo>>, BackupError> {
    let paths = files(
        backup,
        &request.account.id,
        &request.chat.id,
        &format!("{}.%", request.message.local_id),
        "Video",
    )?;
    if paths.is_empty() {
        return Ok(Response { data: None });
    }
    let mut result = VideoInfo::default();
    let included = |kind| {
        request
            .include
            .as_ref()
            .is_none_or(|items| items.contains(&kind))
    };
    for path in paths {
        if path.ends_with(".mp4") && included(Include::Video) {
            result.uri = file(&path).uri;
        }
        if path.ends_with(".video_thum") && included(Include::Cover) {
            let video = &request.message.message_entity["msg"]["videomsg"];
            let mut cover = file(&path);
            cover.width = dimension(&video["@_cdnthumbwidth"]);
            cover.height = dimension(&video["@_cdnthumbheight"]);
            result.cover = Some(cover);
        }
    }
    Ok(Response { data: Some(result) })
}
