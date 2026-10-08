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
    fs::write(directory.join("note.spx"), wrap(bytes)?)
        .map_err(|error| BackupError::context("Cannot write note audio", error))?;
    ffmpeg::run(
        executable,
        directory,
        &["-xerror", "-i", "note.spx", "-c:a", "pcm_s16le", "note.wav"],
    )?;
    fs::remove_file(directory.join("note.spx"))
        .map_err(|error| BackupError::context("Cannot remove conversion input", error))?;
    Ok(directory.join("note.wav"))
}

// Same verified WeChat note frame layout as the web adapter's wrapNoteSpeex:
// 16 kHz mono, 60-byte frames, 320 samples/frame. Other layouts are unsupported.
fn wrap(bytes: &[u8]) -> Result<Vec<u8>, BackupError> {
    if bytes.is_empty() || !bytes.len().is_multiple_of(60) {
        return Err(BackupError::new(
            "Error",
            "Unsupported or truncated note Speex stream",
        ));
    }
    for frame in bytes.chunks_exact(60) {
        if frame[0] >> 3 != 6 || frame[45] & 0x0f != 0x0a || frame[59] & 0x0f != 0x07 {
            return Err(BackupError::new(
                "Error",
                "Unsupported note Speex frame layout",
            ));
        }
    }
    let mut header = vec![0; 80];
    header[..8].copy_from_slice(b"Speex   ");
    header[8..13].copy_from_slice(b"1.2.1");
    for (index, value) in [1u32, 80, 16000, 1, 4, 1, 23800, 320, 0, 1, 0, 0, 0]
        .iter()
        .enumerate()
    {
        header[28 + index * 4..32 + index * 4].copy_from_slice(&value.to_le_bytes());
    }
    let mut output = Vec::with_capacity(144 + bytes.len() / 60 * 88);
    let mut append = |packet: &[u8], sequence: u32, samples: u64, flags: u8| {
        let start = output.len();
        output.resize(start + 28 + packet.len(), 0);
        let page = &mut output[start..];
        page[..4].copy_from_slice(b"OggS");
        page[5] = flags;
        page[6..14].copy_from_slice(&samples.to_le_bytes());
        page[14..18].copy_from_slice(&1u32.to_le_bytes());
        page[18..22].copy_from_slice(&sequence.to_le_bytes());
        page[26] = 1;
        page[27] = packet.len() as u8;
        page[28..].copy_from_slice(packet);
        let mut crc = 0u32;
        for byte in page.iter() {
            crc ^= u32::from(*byte) << 24;
            for _ in 0..8 {
                crc = (crc << 1) ^ if crc & 0x80000000 != 0 { 0x04c11db7 } else { 0 };
            }
        }
        page[22..26].copy_from_slice(&crc.to_le_bytes());
    };
    append(&header, 0, 0, 2);
    append(&[0; 8], 1, 0, 0);
    let count = bytes.len() / 60;
    for (index, frame) in bytes.chunks_exact(60).enumerate() {
        append(
            frame,
            index as u32 + 2,
            (index as u64 + 1) * 320,
            if index + 1 == count { 4 } else { 0 },
        );
    }
    Ok(output)
}
