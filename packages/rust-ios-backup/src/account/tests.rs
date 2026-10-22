use super::*;
use crate::backup::LoadedBackup;
use base64::{engine::general_purpose::STANDARD, Engine};
use serde_json::{json, Value};
use std::fs;

// Reuse the browser adapter's independently generated Python/OpenSSL fixture.
// Only its plaintext files are used; this is not a Rust decryption test.
pub(crate) fn fixture_directory() -> tempfile::TempDir {
    let fixture: Value = serde_json::from_str(include_str!(
        "../../../adapter-ios-backup/src/utils/encryption/test/fixture.json"
    ))
    .unwrap();
    let directory = tempfile::tempdir().unwrap();
    fs::write(
        directory.path().join("Manifest.db"),
        STANDARD
            .decode(fixture["manifestPlain"].as_str().unwrap())
            .unwrap(),
    )
    .unwrap();
    for file in fixture["files"].as_array().unwrap() {
        let id = file["fileID"].as_str().unwrap();
        fs::create_dir_all(directory.path().join(&id[..2])).unwrap();
        fs::write(
            directory.path().join(&id[..2]).join(id),
            STANDARD.decode(file["plain"].as_str().unwrap()).unwrap(),
        )
        .unwrap();
    }
    directory
}

#[test]
fn reads_browser_fixture_with_the_same_account_fields() {
    let directory = fixture_directory();
    let result = read_accounts(directory.path()).unwrap();
    assert_eq!(
        serde_json::to_value(result).unwrap(),
        json!({"data": [
            {"id": "wxid_synthetic_a", "username": "Test account a"},
            {"id": "wxid_synthetic_b", "username": "Test account b"}
        ]})
    );
}

#[test]
fn matches_both_existing_local_info_samples() {
    for bytes in [
        include_bytes!("../../../adapter-ios-backup/tests/dataset/LocalInfo.data/LocalInfo.data")
            .as_slice(),
        include_bytes!("../../../adapter-ios-backup/tests/dataset/LocalInfo.data/LocalInfo_2.data")
            .as_slice(),
    ] {
        assert_eq!(parse_local_info(bytes).unwrap(), "wxid_00000000000000");
    }
}

#[test]
fn prioritizes_logged_in_account_and_ignores_auxiliary_records() {
    let directory = fixture_directory();
    let connection = Connection::open(directory.path().join("Manifest.db")).unwrap();
    let id: String = connection
        .query_row(
            "SELECT fileID FROM Files WHERE relativePath = 'Documents/LocalInfo.data'",
            [],
            |row| row.get(0),
        )
        .unwrap();
    fs::write(
        directory.path().join(&id[..2]).join(id),
        b"\x0a\x10wxid_synthetic_b",
    )
    .unwrap();
    for (id, domain, name, flags) in [
        (
            "1".repeat(40),
            "AppDomain-com.tencent.xin",
            "mmsetting.archive.a.crc",
            1,
        ),
        ("2".repeat(40), "AppDomain-other", "mmsetting.archive.x", 1),
        (
            "3".repeat(40),
            "AppDomain-com.tencent.xin",
            "mmsetting.archive.y",
            2,
        ),
    ] {
        fs::create_dir_all(directory.path().join(&id[..2])).unwrap();
        fs::write(
            directory.path().join(&id[..2]).join(&id),
            b"not account data",
        )
        .unwrap();
        connection
            .execute(
                "INSERT INTO Files(fileID, domain, relativePath, flags) VALUES (?1, ?2, ?3, ?4)",
                rusqlite::params![id, domain, format!("Documents/MMappedKV/{name}"), flags],
            )
            .unwrap();
    }
    let result = read_accounts(directory.path()).unwrap();
    assert_eq!(result.data.len(), 2);
    assert_eq!(result.data[0].id.as_deref(), Some("wxid_synthetic_b"));
}

fn read_accounts(directory: &Path) -> Result<AccountList, BackupError> {
    Ok(AccountList {
        data: LoadedBackup::open(directory.to_owned(), None, || Ok(()))?.accounts,
    })
}
