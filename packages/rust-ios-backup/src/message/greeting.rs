use super::xml;
use crate::{
    account::database::AccountDatabases,
    contact::{self, Contact, Identity},
    errors::BackupError,
};
use rusqlite::OptionalExtension;
use serde::Serialize;
use serde_json::{json, Value};

#[derive(Serialize)]
pub(crate) struct GreetingMessageList {
    data: Vec<GreetingMessage>,
}

#[derive(Serialize)]
struct GreetingMessage {
    id: String,
    local_id: String,
    date: i64,
    direction: i64,
    #[serde(rename = "type")]
    kind: i64,
    message_entity: Value,
    raw_message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    contact: Option<Contact>,
    #[serde(rename = "__Dev", skip_serializing_if = "Option::is_none")]
    developer: Option<Value>,
}

pub(crate) fn list(
    databases: &AccountDatabases,
    include_dev: bool,
) -> Result<GreetingMessageList, BackupError> {
    let mut messages = Vec::new();
    for database in &databases.message {
        let table: Option<String> = database
            .query_row(
                "SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'Hello_%' LIMIT 1",
                [],
                |row| row.get(0),
            )
            .optional()
            .map_err(query_error)?;
        let Some(table) = table else { continue };
        let table = table.replace('"', "\"\"");
        let mut statement = database.prepare(&format!(
            "SELECT CAST(MesSvrID AS TEXT), CAST(MesLocalID AS TEXT), CreateTime, Des, Message, Type, ConIntRes1 FROM \"{table}\" ORDER BY CreateTime DESC"
        )).map_err(query_error)?;
        let mut rows = statement.query([]).map_err(query_error)?;
        let mut has_rows = false;
        while let Some(row) = rows.next().map_err(query_error)? {
            has_rows = true;
            let kind: i64 = row.get(5).map_err(query_error)?;
            if !matches!(kind, 37 | 65) {
                eprintln!("Unsupported message type in greeting message database: {kind}");
                continue;
            }
            let raw_message: String = row.get(4).map_err(query_error)?;
            messages.push(GreetingMessage {
                id: row.get(0).map_err(query_error)?,
                local_id: row.get(1).map_err(query_error)?,
                date: row.get(2).map_err(query_error)?,
                direction: row.get(3).map_err(query_error)?,
                kind,
                message_entity: xml::parse(&raw_message, false)?,
                raw_message,
                contact: None,
                developer: if include_dev {
                    Some(json!({"ConIntRes1": row.get::<_, i64>(6).map_err(query_error)?}))
                } else {
                    None
                },
            });
        }
        // The web adapter chooses the first nonempty table before filtering types.
        if has_rows {
            break;
        }
    }
    let identities = messages
        .iter()
        .map(|message| Identity {
            username: message.message_entity["msg"]["@_fromusername"]
                .as_str()
                .map(str::to_owned),
            encoded_username: message.message_entity["msg"]["@_encryptusername"]
                .as_str()
                .map(str::to_owned),
        })
        .collect::<Vec<_>>();
    let contacts =
        contact::resolve_identities(&databases.contact, &databases.account, &identities)?;
    for (message, contact) in messages.iter_mut().zip(contacts) {
        message.contact = contact;
    }
    Ok(GreetingMessageList { data: messages })
}

fn query_error(error: rusqlite::Error) -> BackupError {
    BackupError::context("Cannot read greeting messages", error)
}
