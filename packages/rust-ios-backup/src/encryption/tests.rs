use super::*;
use crate::{account::database::load_account_databases, backup::LoadedBackup};
use aes::cipher::BlockEncryptMut;
use base64::{engine::general_purpose::STANDARD, Engine};
use serde_json::{json, Value as Json};
use std::fs;

// Independent Python plistlib/sqlite3 + Node OpenSSL fixture already used by
// the web adapter. These are synthetic data, not real-device version coverage.
fn fixture() -> Json {
    serde_json::from_str(include_str!(
        "../../../adapter-ios-backup/src/utils/encryption/test/fixture.json"
    ))
    .unwrap()
}

fn bytes(value: &Json) -> Vec<u8> {
    STANDARD.decode(value.as_str().unwrap()).unwrap()
}
fn error_name<T>(result: Result<T, BackupError>) -> String {
    serde_json::to_value(result.err().expect("expected error")).unwrap()["name"]
        .as_str()
        .unwrap()
        .to_owned()
}
fn open(fixture: &Json, format: &str) -> BackupEncryption {
    BackupEncryption::open(
        &parse_plist(&bytes(&fixture[format])).unwrap(),
        fixture["password"].as_str(),
        &|| Ok(()),
    )
    .unwrap()
    .unwrap()
}
fn plist_bytes(value: &Dictionary) -> Vec<u8> {
    let mut bytes = Vec::new();
    Value::Dictionary(value.clone())
        .to_writer_binary(&mut bytes)
        .unwrap();
    bytes
}
fn metadata(fixture: &Json, size: usize) -> Vec<u8> {
    let mut archive = parse_plist(&bytes(&fixture["fileMetadata"])).unwrap();
    archive.get_mut("$objects").unwrap().as_array_mut().unwrap()[2]
        .as_dictionary_mut()
        .unwrap()
        .insert("Size".into(), Value::Integer((size as u64).into()));
    plist_bytes(&archive)
}
fn encrypt(plain: &[u8], key: &[u8], padded: bool) -> Vec<u8> {
    let mut output = vec![0; plain.len() + 16];
    output[..plain.len()].copy_from_slice(plain);
    let cipher = cbc::Encryptor::<aes::Aes256>::new_from_slices(key, &[0; 16]).unwrap();
    if padded {
        cipher
            .encrypt_padded_mut::<Pkcs7>(&mut output, plain.len())
            .unwrap()
            .to_vec()
    } else {
        cipher
            .encrypt_padded_mut::<NoPadding>(&mut output, plain.len())
            .unwrap()
            .to_vec()
    }
}

#[test]
fn decrypts_independent_modern_and_legacy_fixtures() {
    let f = fixture();
    for format in ["manifestXml", "manifestBinary", "manifestLegacy"] {
        let encryption = open(&f, format);
        assert_eq!(
            encryption
                .decrypt(
                    bytes(&f["fileEncrypted"]),
                    &bytes(&f["fileMetadata"]),
                    &|| Ok(())
                )
                .unwrap(),
            bytes(&f["filePlain"])
        );
        let manifests = if format == "manifestLegacy" {
            vec!["manifestPlain"]
        } else {
            vec!["manifestEncrypted", "manifestUnpadded"]
        };
        for name in manifests {
            assert_eq!(
                encryption
                    .decrypt_manifest(bytes(&f[name]), &|| Ok(()))
                    .unwrap(),
                bytes(&f["manifestPlain"])
            );
        }
    }
}

#[test]
fn padding_takes_precedence_over_stale_file_size() {
    let f = fixture();
    let encryption = open(&f, "manifestBinary");
    for size in [240, 300] {
        assert_eq!(
            encryption
                .decrypt(bytes(&f["fileEncrypted"]), &metadata(&f, size), &|| Ok(()))
                .unwrap(),
            bytes(&f["filePlain"])
        );
    }
    // Same independently specified content/length cases as the web tests.
    for size in [1024 * 1024, 2 * 1024 * 1024 + 7] {
        let plain: Vec<u8> = (0..size).map(|i| (i % 251) as u8).collect();
        let encrypted = encrypt(&plain, &bytes(&f["fileKey"]), true);
        assert_eq!(
            encryption
                .decrypt(encrypted, &metadata(&f, 240), &|| Ok(()))
                .unwrap(),
            plain
        );
    }
    let empty = encrypt(&[], &bytes(&f["fileKey"]), true);
    assert!(encryption
        .decrypt(empty, &metadata(&f, 16), &|| Ok(()))
        .unwrap()
        .is_empty());
}

#[test]
fn raw_cbc_falls_back_to_size_only_when_padding_is_invalid() {
    let f = fixture();
    let encryption = open(&f, "manifestBinary");
    let plain: Vec<u8> = (0..2 * 1024 * 1024 + 32).map(|i| (i % 251) as u8).collect();
    let encrypted = encrypt(&plain, &bytes(&f["fileKey"]), false);
    assert_eq!(
        encryption
            .decrypt(encrypted, &metadata(&f, plain.len() - 7), &|| Ok(()))
            .unwrap(),
        plain[..plain.len() - 7]
    );
    let mut plain = vec![5; 64];
    plain[61] = 4;
    let encrypted = encrypt(&plain, &bytes(&f["fileKey"]), false);
    for size in [16, 64] {
        assert_eq!(
            encryption
                .decrypt(encrypted.clone(), &metadata(&f, size), &|| Ok(()))
                .unwrap(),
            plain[..size]
        );
    }
    assert_eq!(
        error_name(encryption.decrypt(encrypted, &metadata(&f, 65), &|| Ok(()))),
        "InvalidBackupError"
    );
    assert_eq!(
        error_name(encryption.decrypt(vec![0; 17], &metadata(&f, 17), &|| Ok(()))),
        "InvalidBackupError"
    );
}

#[test]
fn password_and_manifest_failures_keep_the_web_error_names() {
    let f = fixture();
    let info = parse_plist(&bytes(&f["manifestBinary"])).unwrap();
    assert_eq!(
        error_name(BackupEncryption::open(&info, None, &|| Ok(()))),
        "BackupPasswordRequiredError"
    );
    for password in ["wrong", "", f["password"].as_str().unwrap().trim()] {
        assert_eq!(
            error_name(BackupEncryption::open(&info, Some(password), &|| Ok(()))),
            "BackupPasswordError"
        );
    }
    // A present broken key cannot cause a fallback to a plaintext manifest.
    let mut malformed = info.clone();
    malformed.insert("ManifestKey".into(), Value::Data(vec![0; 43]));
    assert_eq!(
        error_name(BackupEncryption::open(
            &malformed,
            f["password"].as_str(),
            &|| Ok(())
        )),
        "InvalidBackupError"
    );
    let mut key = data(info.get("ManifestKey")).unwrap().to_vec();
    key[20] ^= 1;
    malformed.insert("ManifestKey".into(), Value::Data(key));
    let encryption = BackupEncryption::open(&malformed, f["password"].as_str(), &|| Ok(()))
        .unwrap()
        .unwrap();
    assert_eq!(
        error_name(encryption.decrypt_manifest(bytes(&f["manifestPlain"]), &|| Ok(()))),
        "InvalidBackupError"
    );
    let legacy = open(&f, "manifestLegacy");
    assert_eq!(
        error_name(legacy.decrypt_manifest(bytes(&f["manifestEncrypted"]), &|| Ok(()))),
        "InvalidBackupError"
    );
    let mut manifest = bytes(&f["manifestPlain"]);
    manifest.push(0);
    assert_eq!(
        error_name(legacy.decrypt_manifest(manifest, &|| Ok(()))),
        "InvalidBackupError"
    );
    // Legacy plaintext manifests still require password verification.
    let legacy_info = parse_plist(&bytes(&f["manifestLegacy"])).unwrap();
    assert_eq!(
        error_name(BackupEncryption::open(&legacy_info, Some("wrong"), &|| Ok(
            ()
        ))),
        "BackupPasswordError"
    );
}

fn change_tag(keybag: &mut [u8], wanted: &[u8], value: u32) {
    let mut offset = 0;
    while offset < keybag.len() {
        let length =
            u32::from_be_bytes(keybag[offset + 4..offset + 8].try_into().unwrap()) as usize;
        if &keybag[offset..offset + 4] == wanted {
            assert_eq!(length, 4);
            keybag[offset + 8..offset + 12].copy_from_slice(&value.to_be_bytes());
        }
        offset += 8 + length;
    }
}

#[test]
fn wrap_flags_and_kdf_limits_follow_the_reference() {
    let f = fixture();
    let info = parse_plist(&bytes(&f["manifestBinary"])).unwrap();
    let raw = data(info.get("BackupKeyBag")).unwrap();
    let password = f["password"].as_str().unwrap();
    let mut keybag = raw.to_vec();
    change_tag(&mut keybag, b"WRAP", 3);
    let unlocked = BackupKeybag::unlock(&keybag, password, &|| Ok(())).unwrap();
    let (_, key) = file_metadata(&bytes(&f["fileMetadata"])).unwrap();
    assert_eq!(
        unlocked.unwrap(&key.unwrap()).unwrap().as_slice(),
        bytes(&f["fileKey"])
    );
    change_tag(&mut keybag, b"WRAP", 1);
    assert_eq!(
        error_name(BackupKeybag::unlock(&keybag, password, &|| Ok(()))),
        "UnsupportedBackupError"
    );
    for (tag, limit) in [(b"ITER", 1_000_001), (b"DPIC", 20_000_001), (b"ITER", 0)] {
        let mut keybag = raw.to_vec();
        change_tag(&mut keybag, tag, limit);
        assert_eq!(
            error_name(BackupKeybag::unlock(&keybag, password, &|| Ok(()))),
            "InvalidBackupError"
        );
    }
    let mut duplicated = raw.to_vec();
    duplicated.extend_from_slice(b"WRAP\0\0\0\x04\0\0\0\x02");
    assert_eq!(
        error_name(BackupKeybag::unlock(&duplicated, password, &|| Ok(()))),
        "InvalidBackupError"
    );
    assert_eq!(
        error_name(BackupKeybag::unlock(
            &raw[..raw.len() - 1],
            password,
            &|| Ok(())
        )),
        "InvalidBackupError"
    );
}

#[test]
fn validates_metadata_references_empty_files_and_wrapped_keys() {
    let f = fixture();
    let encryption = open(&f, "manifestBinary");
    let original = parse_plist(&bytes(&f["fileMetadata"])).unwrap();
    let mut invalid = original.clone();
    invalid.get_mut("$objects").unwrap().as_array_mut().unwrap()[3] =
        Value::Uid(plist::Uid::new(3));
    assert_eq!(
        error_name(file_metadata(&plist_bytes(&invalid))),
        "InvalidBackupError"
    );
    invalid.get_mut("$objects").unwrap().as_array_mut().unwrap()[3] =
        Value::Uid(plist::Uid::new(99));
    assert_eq!(
        error_name(file_metadata(&plist_bytes(&invalid))),
        "InvalidBackupError"
    );
    let mut invalid = original.clone();
    let root = invalid.get_mut("$objects").unwrap().as_array_mut().unwrap()[2]
        .as_dictionary_mut()
        .unwrap();
    root.insert("ProtectionClass".into(), Value::Integer(9.into()));
    assert_eq!(
        error_name(file_metadata(&plist_bytes(&invalid))),
        "InvalidBackupError"
    );
    let mut invalid = original.clone();
    let mut key = file_metadata(&bytes(&f["fileMetadata"]))
        .unwrap()
        .1
        .unwrap();
    key[10] ^= 1;
    invalid.get_mut("$objects").unwrap().as_array_mut().unwrap()[3] = Value::Data(key.to_vec());
    assert_eq!(
        error_name(
            encryption.decrypt(bytes(&f["fileEncrypted"]), &plist_bytes(&invalid), &|| Ok(
                ()
            ))
        ),
        "InvalidBackupError"
    );
    let mut empty = original;
    let root = empty.get_mut("$objects").unwrap().as_array_mut().unwrap()[2]
        .as_dictionary_mut()
        .unwrap();
    root.insert("Size".into(), Value::Integer(0.into()));
    root.remove("EncryptionKey");
    assert!(encryption
        .decrypt(vec![], &plist_bytes(&empty), &|| Ok(()))
        .unwrap()
        .is_empty());
    assert_eq!(
        error_name(encryption.decrypt(vec![0; 16], &plist_bytes(&empty), &|| Ok(()))),
        "InvalidBackupError"
    );
}

fn encrypted_directory(f: &Json, format: &str) -> tempfile::TempDir {
    let directory = tempfile::tempdir().unwrap();
    fs::write(directory.path().join("Manifest.plist"), bytes(&f[format])).unwrap();
    let manifest = if format == "manifestLegacy" {
        "manifestPlain"
    } else {
        "manifestEncrypted"
    };
    fs::write(directory.path().join("Manifest.db"), bytes(&f[manifest])).unwrap();
    for file in f["files"].as_array().unwrap() {
        let id = file["fileID"].as_str().unwrap();
        fs::create_dir_all(directory.path().join(&id[..2])).unwrap();
        fs::write(
            directory.path().join(&id[..2]).join(id),
            bytes(&file["encrypted"]),
        )
        .unwrap();
    }
    directory
}

#[test]
fn discovers_accounts_in_independent_encrypted_backups() {
    let f = fixture();
    for format in ["manifestXml", "manifestBinary", "manifestLegacy"] {
        let directory = encrypted_directory(&f, format);
        assert_eq!(
            error_name(LoadedBackup::open(
                directory.path().to_owned(),
                None,
                || Ok(())
            )),
            "BackupPasswordRequiredError"
        );
        assert_eq!(
            error_name(LoadedBackup::open(
                directory.path().to_owned(),
                Some("wrong".into()),
                || Ok(())
            )),
            "BackupPasswordError"
        );
        let backup = LoadedBackup::open(
            directory.path().to_owned(),
            Some(f["password"].as_str().unwrap().into()),
            || Ok(()),
        )
        .unwrap();
        assert_eq!(
            serde_json::to_value(backup.accounts).unwrap(),
            json!([
                {"id":"wxid_synthetic_a", "username":"Test account a"},
                {"id":"wxid_synthetic_b", "username":"Test account b"}
            ])
        );
        for file in f["files"].as_array().unwrap() {
            let id = file["fileID"].as_str().unwrap();
            assert_eq!(
                fs::read(directory.path().join(&id[..2]).join(id)).unwrap(),
                bytes(&file["encrypted"])
            );
        }
    }
}

#[test]
fn opens_encrypted_account_databases_without_plaintext_files() {
    let f = fixture();
    let directory = encrypted_directory(&f, "manifestBinary");
    // Build the integration database using SQLite, with a known query result.
    let plain_path = directory.path().join("fixture.sqlite");
    let connection = rusqlite::Connection::open(&plain_path).unwrap();
    connection
        .execute_batch("CREATE TABLE fixture(value INTEGER); INSERT INTO fixture VALUES(42)")
        .unwrap();
    connection.close().unwrap();
    let mut database = fs::read(&plain_path).unwrap();
    fs::remove_file(plain_path).unwrap();
    database[18..20].copy_from_slice(&[2, 2]);
    let manifest_path = directory.path().join("fixture-manifest.sqlite");
    fs::write(&manifest_path, bytes(&f["manifestPlain"])).unwrap();
    let manifest = rusqlite::Connection::open(&manifest_path).unwrap();
    for (number, suffix) in [
        (1, "session/session.db"),
        (2, "DB/WCDB_Contact.sqlite"),
        (3, "DB/message_0.sqlite"),
    ] {
        let id = format!("{number:040x}");
        fs::create_dir_all(directory.path().join("00")).unwrap();
        fs::write(
            directory.path().join("00").join(&id),
            encrypt(&database, &bytes(&f["fileKey"]), true),
        )
        .unwrap();
        manifest
            .execute(
                "INSERT INTO Files VALUES(?1, 'AppDomain-com.tencent.xin', ?2, 1, ?3)",
                rusqlite::params![
                    id,
                    format!("Documents/76f88c13175a2f283275eff65cbd3b07/{suffix}"),
                    metadata(&f, database.len())
                ],
            )
            .unwrap();
    }
    manifest.close().unwrap();
    let encrypted = encrypt(&fs::read(&manifest_path).unwrap(), &[22; 32], true);
    fs::remove_file(manifest_path).unwrap();
    fs::write(directory.path().join("Manifest.db"), &encrypted).unwrap();
    let mut before: Vec<_> = fs::read_dir(directory.path())
        .unwrap()
        .map(|entry| entry.unwrap().file_name())
        .collect();
    let backup = LoadedBackup::open(
        directory.path().to_owned(),
        Some(f["password"].as_str().unwrap().into()),
        || Ok(()),
    )
    .unwrap();
    let databases = load_account_databases(&backup, "wxid_synthetic_a", || Ok(())).unwrap();
    for database in [
        &databases.session,
        &databases.contact,
        &databases.message[0],
    ] {
        assert_eq!(
            database
                .query_row("SELECT value FROM fixture", [], |row| row.get::<_, i64>(0))
                .unwrap(),
            42
        );
    }
    assert_eq!(
        fs::read(directory.path().join("Manifest.db")).unwrap(),
        encrypted
    );
    let mut after: Vec<_> = fs::read_dir(directory.path())
        .unwrap()
        .map(|entry| entry.unwrap().file_name())
        .collect();
    before.sort();
    after.sort();
    assert_eq!(before, after);
}
