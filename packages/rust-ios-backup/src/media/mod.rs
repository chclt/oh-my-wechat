mod attach;
mod image;
pub(crate) mod record;
mod video;
mod voice;

pub(crate) use attach::{get as attach, AttachRequest};
pub(crate) use image::{get as image, ImageInfo, ImageRequest};
pub(crate) use video::{get as video, VideoInfo, VideoRequest};
pub(crate) use voice::{get as voice, VoiceInfo, VoiceRequest};

use crate::{backup::LoadedBackup, errors::BackupError};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Deserialize)]
pub(crate) struct Identifier {
    pub id: String,
}

#[derive(Deserialize)]
pub(crate) struct Message {
    pub local_id: String,
    #[serde(default)]
    pub message_entity: Value,
}

#[derive(Serialize)]
pub(crate) struct Response<T> {
    pub data: T,
}

#[derive(Default, Serialize)]
pub(crate) struct MediaFile {
    pub uri: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub width: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub height: Option<f64>,
}

fn file(path: &str) -> MediaFile {
    MediaFile {
        uri: format!("ios-backup:{path}"),
        ..MediaFile::default()
    }
}

fn dimension(value: &Value) -> Option<f64> {
    let number = match value {
        Value::String(value) => value.trim().parse().ok(),
        Value::Number(value) => value.as_f64(),
        _ => None,
    };
    number.filter(|value| *value > 0.0)
}

fn files(
    backup: &LoadedBackup,
    account: &str,
    chat: &str,
    filename_pattern: &str,
    directory: &str,
) -> Result<Vec<String>, BackupError> {
    let pattern = format!(
        "Documents/{:x}/{directory}/{:x}/{filename_pattern}",
        md5::compute(account),
        md5::compute(chat)
    );
    let manifest = backup
        .manifest
        .lock()
        .map_err(|error| BackupError::context("Manifest database unavailable", error))?;
    let mut statement = manifest.prepare("SELECT relativePath FROM Files WHERE domain = 'AppDomain-com.tencent.xin' AND relativePath LIKE ?1 AND flags = 1 ORDER BY relativePath").map_err(|error| BackupError::context("Cannot query media files", error))?;
    let rows = statement
        .query_map([pattern], |row| row.get(0))
        .map_err(|error| BackupError::context("Cannot query media files", error))?
        .collect::<Result<_, _>>()
        .map_err(|error| BackupError::context("Cannot read media records", error));
    rows
}
