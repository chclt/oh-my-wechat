mod audio;
mod file;
mod image;
mod video;

pub(crate) use audio::get as audio;
pub(crate) use file::get as file;
pub(crate) use image::get as image;
pub(crate) use video::get as video;

use super::{Identifier, Message};
use serde::Deserialize;

#[derive(Deserialize)]
pub(crate) struct RecordRequest {
    account: Identifier,
    chat: Identifier,
    message: Message,
    record: RecordIdentifier,
}

#[derive(Deserialize)]
struct RecordIdentifier {
    #[serde(rename = "@_dataid")]
    data_id: String,
}

#[derive(Deserialize)]
pub(crate) struct RecordFileRequest {
    account: Identifier,
    chat: Identifier,
    message: Message,
    record: RecordFile,
}

#[derive(Deserialize)]
struct RecordFile {
    #[serde(rename = "@_dataid")]
    data_id: String,
    datafmt: String,
}
