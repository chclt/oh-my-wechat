use super::ffmpeg;
use crate::errors::BackupError;
use std::{
    fs,
    path::{Path, PathBuf},
};

// Some backup MP4s store seconds of audio before the first video packet.
// WebKitGTK's Blob playback can stall while waiting for both streams. Remuxing
// interleaves their packets without re-encoding either stream.
pub(super) fn remux(
    bytes: &[u8],
    directory: &Path,
    executable: &Path,
) -> Result<PathBuf, BackupError> {
    fs::write(directory.join("input.mp4"), bytes)
        .map_err(|error| BackupError::context("Cannot write video input", error))?;
    ffmpeg::run(
        executable,
        directory,
        &["-i", "input.mp4", "-map", "0", "-c", "copy", "output.mp4"],
    )?;
    fs::remove_file(directory.join("input.mp4"))
        .map_err(|error| BackupError::context("Cannot remove remux input", error))?;
    Ok(directory.join("output.mp4"))
}
