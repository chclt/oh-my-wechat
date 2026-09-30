use super::*;
use rusqlite::params;
use serde_json::json;

#[test]
fn contact_list_preserves_web_fields_and_protobuf_defaults() {
    let db = Connection::open_in_memory().unwrap();
    db.execute_batch(
        "CREATE TABLE Friend(username TEXT, type INTEGER, dbContactProfile BLOB, dbContactHeadImage BLOB, dbContactRemark BLOB, dbContactSocial BLOB, dbContactChatRoom BLOB, dbContactOpenIM BLOB);
         CREATE TABLE OpenIMContact AS SELECT * FROM Friend WHERE 0;",
    )
    .unwrap();
    // Literal bytes follow contact.proto, independently of the Rust encoder.
    db.execute(
        "INSERT INTO Friend VALUES ('alice', 3, X'', ?1, ?2, X'', NULL, NULL)",
        params![
            b"\x12\x03img\x1a\x06origin".as_slice(),
            b"\x0a\x05Alice\x1a\x05Alias\x22\x05alias\x2a\x01A\x32\x05alice".as_slice()
        ],
    )
    .unwrap();
    db.execute_batch(
        "INSERT INTO Friend VALUES ('gh_public', 1, X'', X'', X'', X'', NULL, X'');
         INSERT INTO Friend VALUES ('room@chatroom', 1, X'', X'1200', X'0a001a0022002a003200', X'', X'', NULL);
         INSERT INTO Friend VALUES ('filtered', 2, X'', X'', X'', X'', NULL, NULL);
         INSERT INTO OpenIMContact VALUES ('alice', 1, X'', X'', X'', X'', NULL, X'');
         INSERT INTO OpenIMContact VALUES ('openim_without_blob', 1, X'', X'', X'', X'', NULL, NULL);
         INSERT INTO OpenIMContact VALUES ('filtered_openim', 0, X'', X'', X'', X'', NULL, X'');",
    )
    .unwrap();
    // Production queries use the same read-only snapshot connection.
    let snapshot =
        crate::database::open_snapshot(db.serialize(rusqlite::MAIN_DB).unwrap().to_vec()).unwrap();
    assert_eq!(
        serde_json::to_value(list(&snapshot).unwrap()).unwrap(),
        json!({"data": [
            {
                "id": "alice", "username": "Alice", "usernamePinyin": "alice",
                "remark": "Alias", "remarkPinyin": "alias", "remarkPinyinInits": "A",
                "photo": {"thumb": "img"}, "is_openim": false
            },
            {"id": "gh_public", "username": "", "usernamePinyin": "", "is_openim": true},
            {"id": "room@chatroom", "username": "", "usernamePinyin": "", "is_openim": false},
            {"id": "alice", "username": "", "usernamePinyin": "", "is_openim": true},
            {"id": "openim_without_blob", "username": "", "usernamePinyin": "", "is_openim": false}
        ]})
    );
}

#[test]
fn user_lookup_keeps_account_first_and_duplicate_database_records() {
    let db = Connection::open_in_memory().unwrap();
    db.execute_batch(
        "CREATE TABLE Friend(username TEXT, type INTEGER, dbContactProfile BLOB, dbContactHeadImage BLOB, dbContactRemark BLOB, dbContactSocial BLOB, dbContactChatRoom BLOB, dbContactOpenIM BLOB);
         CREATE TABLE OpenIMContact AS SELECT * FROM Friend WHERE 0;",
    )
    .unwrap();
    // Explicit ID lookup does not use the address book's type filter.
    // These bytes describe distinct records with the same username.
    db.execute_batch(
        "INSERT INTO Friend VALUES ('me', 0, X'', X'', X'0a074442206e616d65', X'', NULL, NULL);
         INSERT INTO Friend VALUES ('alice', 0, X'', X'', X'0a05416c69636512027778', X'', NULL, NULL);
         INSERT INTO OpenIMContact VALUES ('alice', 0, X'', X'', X'0a001a00', X'', NULL, X'');",
    )
    .unwrap();
    let snapshot =
        crate::database::open_snapshot(db.serialize(rusqlite::MAIN_DB).unwrap().to_vec()).unwrap();
    let account = Account {
        id: Some("me".into()),
        username: Some("Myself".into()),
        ..Account::default()
    };
    let ids = ["alice", "missing", "me", "alice", "me"].map(str::to_owned);
    assert_eq!(
        serde_json::to_value(find(&snapshot, &account, &ids).unwrap()).unwrap(),
        json!([
            {"id": "me", "username": "Myself"},
            {"id": "me", "user_id": "", "username": "DB name", "bio": "", "background": "", "is_openim": false, "_is_pinned": false},
            {"id": "alice", "user_id": "wx", "username": "Alice", "bio": "", "background": "", "is_openim": false, "_is_pinned": false},
            {"id": "alice", "user_id": "", "username": "", "bio": "", "background": "", "is_openim": true, "_is_pinned": false}
        ])
    );
}
