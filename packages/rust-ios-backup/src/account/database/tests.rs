use super::*;
use crate::account::tests::fixture_directory;
use std::fs;
use std::path::{Path, PathBuf};

// Independently calculated MD5 of wxid_synthetic_a.
const PREFIX: &str = "Documents/76f88c13175a2f283275eff65cbd3b07";

fn add_database(directory: &Path, suffix: &str, number: u32) -> PathBuf {
    let id = format!("{number:040x}");
    let path = directory.join(&id[..2]).join(&id);
    fs::create_dir_all(path.parent().unwrap()).unwrap();
    let database = Connection::open(&path).unwrap();
    database
        .execute_batch("CREATE TABLE fixture(value INTEGER)")
        .unwrap();
    database
        .execute("INSERT INTO fixture VALUES (?1)", [number])
        .unwrap();
    database.close().unwrap();
    // Model a checkpointed iOS backup whose main file still declares WAL.
    let mut bytes = fs::read(&path).unwrap();
    bytes[18..20].copy_from_slice(&[2, 2]);
    fs::write(&path, bytes).unwrap();
    let manifest = Connection::open(directory.join("Manifest.db")).unwrap();
    manifest.execute("INSERT INTO Files(fileID, domain, relativePath, flags) VALUES (?1, 'AppDomain-com.tencent.xin', ?2, 1)", rusqlite::params![id, format!("{PREFIX}/{suffix}")]).unwrap();
    path
}

fn prepared_directory() -> tempfile::TempDir {
    let directory = fixture_directory();
    add_database(directory.path(), "session/session.db", 1);
    add_database(directory.path(), "DB/WCDB_Contact.sqlite", 2);
    directory
}

fn value(database: &Connection) -> i64 {
    database
        .query_row("SELECT value FROM fixture", [], |row| row.get(0))
        .unwrap()
}

#[test]
fn opens_wal_snapshots_read_only_and_keeps_source_unchanged() {
    let directory = prepared_directory();
    add_database(directory.path(), "DB/message_2.sqlite", 4);
    let file = add_database(directory.path(), "DB/message_10.sqlite", 3);
    let source = fs::read(&file).unwrap();
    let files_before = fs::read_dir(file.parent().unwrap()).unwrap().count();
    let backup = LoadedBackup::open(directory.path().to_owned(), None, || Ok(())).unwrap();
    let loaded = load_account_databases(&backup, "wxid_synthetic_a", || Ok(())).unwrap();
    assert_eq!(loaded.account.id.as_deref(), Some("wxid_synthetic_a"));
    assert_eq!(value(&loaded.session), 1);
    assert_eq!(value(&loaded.contact), 2);
    assert_eq!(
        loaded.message.iter().map(value).collect::<Vec<_>>(),
        vec![3, 4]
    );
    for connection in [&loaded.session, &loaded.contact]
        .into_iter()
        .chain(loaded.message.iter())
    {
        assert!(connection
            .execute("INSERT INTO fixture VALUES (99)", [])
            .is_err());
    }
    drop(loaded);
    assert_eq!(fs::read(file).unwrap(), source);
    assert_eq!(
        fs::read_dir(directory.path().join("00")).unwrap().count(),
        files_before
    );
}
