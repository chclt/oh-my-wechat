use super::ffmpeg;
use crate::errors::BackupError;
use std::{
    fs,
    path::{Path, PathBuf},
};

pub(super) fn convert(
    bytes: &[u8],
    directory: &Path,
    executable: &Path,
) -> Result<PathBuf, BackupError> {
    let pcm = silk_rs::decode_silk(bytes, 24000)
        .map_err(|error| BackupError::context("Silk decoding failed", error))?;
    fs::write(directory.join("input.pcm"), pcm)
        .map_err(|error| BackupError::context("Cannot write decoded voice", error))?;
    ffmpeg::run(
        executable,
        directory,
        &[
            "-f",
            "s16le",
            "-ar",
            "24000",
            "-ac",
            "1",
            "-i",
            "input.pcm",
            "output.wav",
        ],
    )?;
    fs::remove_file(directory.join("input.pcm"))
        .map_err(|error| BackupError::context("Cannot remove conversion input", error))?;
    Ok(directory.join("output.wav"))
}
