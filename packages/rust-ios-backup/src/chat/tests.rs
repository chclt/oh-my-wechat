use super::*;
use crate::account::Account;
use rusqlite::{params, Connection};
use serde_json::{json, Value};

fn fixture() -> AccountDatabases {
    let session = Connection::open_in_memory().unwrap();
    session.execute_batch("CREATE TABLE SessionAbstract(UsrName TEXT, ConIntRes1 INTEGER, CreateTime INTEGER);
        INSERT INTO SessionAbstract VALUES ('alice', 1, 30), ('room@chatroom', 0, 20), ('missing', NULL, 10), ('me', 2, 5), ('missing@chatroom', 0, 0);").unwrap();
    let contact = Connection::open_in_memory().unwrap();
    contact.execute_batch("CREATE TABLE Friend(username TEXT, type INTEGER, dbContactProfile BLOB, dbContactHeadImage BLOB, dbContactRemark BLOB, dbContactSocial BLOB, dbContactChatRoom BLOB, dbContactOpenIM BLOB);
        CREATE TABLE OpenIMContact AS SELECT * FROM Friend WHERE 0;").unwrap();
    // Literal protobuf bytes use the web contact.proto field numbers. Empty
    // protobuf messages and SQL NULL deliberately exercise different defaults.
    contact
        .execute(
            "INSERT INTO Friend VALUES (?1, ?2, ?3, ?4, ?5, ?6, NULL, NULL)",
            params![
                "alice",
                1 << 11,
                b"\x2a\x03bio".as_slice(),
                b"\x12\x03img".as_slice(),
                b"\x0a\x05Alice\x12\x02wx\x1a\x05Alias".as_slice(),
                b"\x4a\x02bg\x5a\x03123".as_slice()
            ],
        )
        .unwrap();
    contact
        .execute(
            "INSERT INTO Friend VALUES (?1, ?2, X'', X'', X'', X'', ?3, NULL)",
            params![
                "room@chatroom",
                (1 << 11) | (1 << 28),
                b"\x0a\x16alice;me;absent;alice;".as_slice()
            ],
        )
        .unwrap();
    AccountDatabases {
        account: Account {
            id: Some("me".into()),
            username: Some("Myself".into()),
            ..Account::default()
        },
        session,
        contact,
        message: vec![],
    }
}

fn data(db: &AccountDatabases, ids: Option<&[String]>) -> Value {
    serde_json::to_value(list(db, ids).unwrap()).unwrap()["data"].clone()
}

#[test]
fn chat_order_filter_and_contact_defaults_match_web() {
    let db = fixture();
    let result = data(&db, None);
    assert_eq!(
        result
            .as_array()
            .unwrap()
            .iter()
            .map(|chat| chat["id"].as_str().unwrap())
            .collect::<Vec<_>>(),
        [
            "alice",
            "room@chatroom",
            "missing",
            "me",
            "missing@chatroom"
        ]
    );
    let account = json!({"id":"me", "username":"Myself"});
    let alice = json!({"id":"alice", "user_id":"wx", "username":"Alice", "remark":"Alias", "bio":"bio", "background":"bg", "phone":"123", "photo":{"thumb":"img"}, "is_openim":false, "_is_pinned":true});
    assert_eq!(
        result[0],
        json!({"type":"private", "id":"alice", "title":"Alias", "photo":"img", "is_muted":true, "is_pinned":true, "is_collapsed":false, "members":[account, alice], "user":alice})
    );
    assert_eq!(result[1]["title"], "群聊");
    assert_eq!(result[1]["is_collapsed"], true);
    assert_eq!(result[1]["is_pinned"], true);
    assert_eq!(result[1]["members"], json!([alice, account, alice]));
    assert_eq!(
        result[1]["chatroom"]["_member_ids"],
        json!(["alice", "me", "absent", "alice", ""])
    );
    assert!(result[1]["chatroom"].get("username").is_none());
    assert!(result[1]["chatroom"].get("remark").is_none());
    assert_eq!(data(&db, Some(&[])), json!([]));
    assert_eq!(
        data(
            &db,
            Some(&["missing".into(), "alice".into(), "alice".into()])
        ),
        json!([result[0], result[2]])
    );
    assert_eq!(data(&db, Some(&["' OR 1=1 --".into()])), json!([]));
}

#[test]
fn missing_contacts_and_self_preserve_absence() {
    let db = fixture();
    let result = data(&db, None);
    assert_eq!(
        result[2],
        json!({"type":"private", "id":"missing", "title":"missing", "is_muted":false, "is_pinned":false, "is_collapsed":false, "members":[{"id":"me","username":"Myself"}, null]})
    );
    assert_eq!(result[3]["title"], "Myself");
    assert_eq!(result[3]["is_muted"], false); // Drizzle maps only 1 to true.
    assert!(result[3].get("is_pinned").is_none());
    assert_eq!(
        result[4],
        json!({"type":"chatroom", "id":"missing@chatroom", "title":"-", "is_muted":false, "is_pinned":false, "is_collapsed":false, "members":[]})
    );
}

#[test]
fn openim_overrides_friend_and_member_self_uses_account() {
    let db = fixture();
    db.contact.execute_batch("INSERT INTO OpenIMContact VALUES ('alice', 0, X'', X'', X'0a001a00', X'5a00', NULL, X'');
        INSERT INTO Friend VALUES ('me', 0, X'', X'', X'0a074442206e616d65', X'', NULL, NULL);").unwrap();
    let result = data(&db, None);
    assert_eq!(
        result[0]["user"],
        json!({"id":"alice", "user_id":"", "username":"", "bio":"", "background":"", "is_openim":true, "_is_pinned":false})
    );
    assert_eq!(result[0]["title"], "");
    assert_eq!(
        result[1]["members"][1],
        json!({"id":"me", "username":"Myself"})
    );
    assert_eq!(result[3]["title"], "DB name");
}
