use super::{dimension, file, files, Identifier, MediaFile, Message, Response};
use crate::{backup::LoadedBackup, errors::BackupError};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
enum Size {
    Hd,
    Regular,
    Thumbnail,
    Video,
}

#[derive(Default, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
enum Domain {
    #[default]
    Image,
    Opendata,
}

#[derive(Deserialize)]
pub(crate) struct ImageRequest {
    account: Identifier,
    chat: Identifier,
    message: Message,
    sizes: Option<Vec<Size>>,
    #[serde(default)]
    domain: Domain,
}

#[derive(Default, Serialize)]
pub(crate) struct ImageInfo {
    #[serde(skip_serializing_if = "Option::is_none")]
    hd: Option<MediaFile>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) regular: Option<MediaFile>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) thumbnail: Option<MediaFile>,
    #[serde(skip_serializing_if = "Option::is_none")]
    video: Option<MediaFile>,
}

pub(crate) fn get(
    backup: &LoadedBackup,
    request: ImageRequest,
) -> Result<Response<ImageInfo>, BackupError> {
    let lookup = |directory| {
        files(
            backup,
            &request.account.id,
            &request.chat.id,
            &format!("{}.%", request.message.local_id),
            directory,
        )
    };
    let mut paths = lookup(if request.domain == Domain::Image {
        "Img"
    } else {
        "OpenData"
    })?;
    if request.domain == Domain::Image {
        paths.extend(lookup("ImgV2")?);
    }
    let mut result = ImageInfo::default();
    for path in paths {
        let (size, dimensions, target) = if path.ends_with(".pic_hd") {
            (Size::Hd, "cdnhd", &mut result.hd)
        } else if path.ends_with(".pic") {
            (Size::Regular, "cdnmid", &mut result.regular)
        } else if path.ends_with(".pic_thum") || path.ends_with(".pic_thum.tmp") {
            if path.ends_with(".tmp") && result.thumbnail.is_some() {
                continue;
            }
            (Size::Thumbnail, "cdnthumb", &mut result.thumbnail)
        } else if path.ends_with(".pic.mp4") {
            (Size::Video, "", &mut result.video)
        } else {
            continue;
        };
        if request
            .sizes
            .as_ref()
            .is_some_and(|sizes| !sizes.contains(&size))
        {
            continue;
        }
        let mut info = file(&path);
        if request.domain == Domain::Image && size != Size::Video {
            let image = &request.message.message_entity["msg"]["img"];
            info.width = dimension(&image[format!("@_{dimensions}width")]);
            info.height = dimension(&image[format!("@_{dimensions}height")]);
        }
        *target = Some(info);
    }
    Ok(Response { data: result })
}
