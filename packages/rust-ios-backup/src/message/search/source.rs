use super::store::Document;
use crate::{account::database::AccountDatabases, errors::BackupError};
use rusqlite::types::ValueRef;
use std::collections::HashMap;

pub(super) struct Table {
    pub database: usize,
    pub name: String,
    pub chat_id: String,
}

pub(super) fn tables(databases: &AccountDatabases) -> Result<Vec<Table>, BackupError> {
    let mut statement = databases
        .session
        .prepare("SELECT UsrName FROM SessionAbstract")
        .map_err(error)?;
    let chats = statement
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(error)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(error)?;
    let names: HashMap<_, _> = chats
        .into_iter()
        .map(|id| (format!("Chat_{:x}", md5::compute(&id)), id))
        .collect();
    let mut tables = Vec::new();
    for (index, database) in databases.message.iter().enumerate() {
        let mut statement = database.prepare(r"SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'Chat\_%' ESCAPE '\'").map_err(error)?;
        let rows = statement
            .query_map([], |row| row.get::<_, String>(0))
            .map_err(error)?;
        for row in rows {
            let name = row.map_err(error)?;
            if let Some(chat_id) = names.get(&name) {
                tables.push(Table {
                    database: index,
                    name,
                    chat_id: chat_id.clone(),
                });
            }
        }
    }
    Ok(tables)
}

pub(super) struct Batch {
    pub documents: Vec<Document>,
    pub last_row: Option<i64>,
}

pub(super) fn read(
    databases: &AccountDatabases,
    table: &Table,
    after: Option<i64>,
) -> Result<Batch, BackupError> {
    // Bounded reads release the account lock between batches. Tokenization and
    // index writes happen outside that lock and never modify backup databases.
    let condition = if after.is_some() {
        "WHERE rowid > ?1"
    } else {
        ""
    };
    let mut statement = databases.message[table.database].prepare(&format!(
        "SELECT rowid, CAST(MesLocalID AS TEXT), CreateTime, Des, Type, Message FROM {} {condition} ORDER BY rowid LIMIT 512", table.name
    )).map_err(error)?;
    let mut rows = statement
        .query(rusqlite::params_from_iter(after))
        .map_err(error)?;
    let mut documents = Vec::new();
    let mut last_row = None;
    while let Some(row) = rows.next().map_err(error)? {
        last_row = Some(row.get(0).map_err(error)?);
        if row.get::<_, i64>(4).map_err(error)? != 1 {
            continue;
        }
        // The base web adapter skips compressed (BLOB) and null message bodies.
        let ValueRef::Text(bytes) = row.get_ref(5).map_err(error)? else {
            continue;
        };
        let content = std::str::from_utf8(bytes)
            .map_err(|e| BackupError::context("Cannot decode search text", e))?;
        let direction: i64 = row.get(3).map_err(error)?;
        let (sender_id, content) = if table.chat_id.ends_with("@chatroom") && direction == 1 {
            crate::message::content::split_group_content(content)
        } else {
            (
                if direction == 0 {
                    databases
                        .account
                        .id
                        .as_ref()
                        .expect("loaded account has an id")
                } else {
                    &table.chat_id
                }
                .clone(),
                content.to_owned(),
            )
        };
        documents.push(Document {
            chat_id: table.chat_id.clone(),
            sender_id,
            message_local_id: row.get(1).map_err(error)?,
            create_time: row.get(2).map_err(error)?,
            message_plain_text: content,
        });
    }
    Ok(Batch {
        documents,
        last_row,
    })
}

fn error(error: rusqlite::Error) -> BackupError {
    BackupError::context("Cannot read message search source", error)
}
