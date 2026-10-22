use crate::errors::BackupError;
use std::{
    path::{Path, PathBuf},
    process::{Command, Stdio},
};
pub(super) fn executable() -> Result<PathBuf, BackupError> {
    let executable = std::env::current_exe()
        .map_err(|error| BackupError::context("Cannot locate FFmpeg", error))?;
    Ok(executable.with_file_name(if cfg!(windows) {
        "ffmpeg.exe"
    } else {
        "ffmpeg"
    }))
}

pub(super) fn run(
    executable: &Path,
    directory: &Path,
    arguments: &[&str],
) -> Result<(), BackupError> {
    let mut command = Command::new(executable);
    command
        .current_dir(directory)
        .args(["-nostdin", "-y", "-v", "error"])
        .args(arguments)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::piped());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000);
    }
    let output = command
        .output()
        .map_err(|error| BackupError::context("Cannot start FFmpeg", error))?;
    if !output.status.success() {
        return Err(BackupError::context(
            "Media conversion failed",
            String::from_utf8_lossy(&output.stderr),
        ));
    }
    Ok(())
}
