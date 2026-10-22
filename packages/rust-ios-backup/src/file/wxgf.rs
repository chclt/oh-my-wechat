use crate::errors::BackupError;
use std::path::{Path, PathBuf};

pub(super) fn is_wxgf(bytes: &[u8]) -> bool {
    bytes.starts_with(b"wxgf")
}

// Plus replaces this format-specific implementation; file ownership and queueing
// stay in the common resolver. Its converter can use the shared FFmpeg runner.
pub(super) fn convert(
    _bytes: &[u8],
    _directory: &Path,
    _executable: &Path,
) -> Result<PathBuf, BackupError> {
    Err(BackupError::new("Error", "Unsupported WXGF image."))
}
