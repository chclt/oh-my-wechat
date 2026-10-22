use super::MessageKind;
use crate::{account::database::AccountDatabases, errors::BackupError};
use rusqlite::{
    params_from_iter,
    types::{Value, ValueRef},
    Connection, OptionalExtension,
};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub(crate) struct Identifier {
    pub(crate) id: String,
}

#[derive(Deserialize)]
pub(crate) struct MessageListRequest {
    pub(crate) account: Identifier,
    pub(super) chat: Identifier,
    #[serde(rename = "type")]
    message_type: Option<Filter<MessageKind>>,
    type_app: Option<Filter<i64>>,
    cursor: Option<String>,
    limit: usize,
}

#[derive(Deserialize)]
#[serde(untagged)]
enum Filter<T> {
    One(T),
    Many(Vec<T>),
}

impl<T> Filter<T> {
    fn values(&self) -> &[T] {
        match self {
            Self::One(value) => std::slice::from_ref(value),
            Self::Many(values) => values,
        }
    }
}

#[derive(Clone, Copy, Deserialize, Serialize)]
enum Condition {
    #[serde(rename = "<")]
    Before,
    #[serde(rename = "<=")]
    BeforeInclusive,
    #[serde(rename = ">")]
    After,
    #[serde(rename = ">=")]
    AfterInclusive,
    #[serde(rename = "<>")]
    Around,
}

impl Condition {
    fn before(self) -> bool {
        matches!(self, Self::Before | Self::BeforeInclusive)
    }
    fn operator(self) -> &'static str {
        match self {
            Self::Before => "<",
            Self::BeforeInclusive => "<=",
            Self::After => ">",
            Self::AfterInclusive => ">=",
            Self::Around => unreachable!("around reads each side separately"),
        }
    }
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct Cursor {
    condition: Condition,
    #[serde(skip_serializing_if = "Option::is_none")]
    value: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message_local_id: Option<String>,
}

struct Anchor {
    value: i64,
    message_local_id: Option<String>,
}

#[derive(Default, Serialize)]
pub(super) struct PageMeta {
    #[serde(skip_serializing_if = "Option::is_none")]
    cursor: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    previous_cursor: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    next_cursor: Option<String>,
}

pub(super) struct MessageRow {
    pub(super) local_id: String,
    pub(super) id: String,
    pub(super) date: i64,
    pub(super) direction: i64,
    pub(super) content: MessageContent,
    pub(super) message_type: i64,
}

pub(super) enum MessageContent {
    Text(String),
    Blob(Vec<u8>),
    Null,
}

const COLUMNS: &str =
    "CAST(MesLocalID AS TEXT), CAST(MesSvrID AS TEXT), CreateTime, Des, Message, Type";

impl MessageRow {
    fn read(row: &rusqlite::Row<'_>) -> rusqlite::Result<Self> {
        let content = match row.get_ref(4)? {
            ValueRef::Null => MessageContent::Null,
            ValueRef::Blob(bytes) => MessageContent::Blob(bytes.to_vec()),
            _ => MessageContent::Text(row.get(4)?),
        };
        Ok(Self {
            local_id: row.get(0)?,
            id: row.get(1)?,
            date: row.get(2)?,
            direction: row.get(3)?,
            content,
            message_type: row.get(5)?,
        })
    }
}

fn table_name(chat_id: &str) -> String {
    format!("Chat_{:x}", md5::compute(chat_id.as_bytes()))
}

fn source<'a>(
    databases: &'a AccountDatabases,
    table: &str,
) -> Result<Option<&'a Connection>, BackupError> {
    for database in &databases.message {
        if database
            .query_row(
                "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?1 LIMIT 1",
                [table],
                |row| row.get::<_, String>(0),
            )
            .optional()
            .map_err(query_error)?
            .is_some()
        {
            return Ok(Some(database));
        }
    }
    Ok(None)
}

fn filters(request: &MessageListRequest) -> (Vec<String>, Vec<Value>) {
    let mut clauses = Vec::new();
    let mut parameters = Vec::new();
    if let Some(types) = &request.message_type {
        let types = types.values();
        if types.is_empty() {
            clauses.push("0".into());
        } else {
            clauses.push(format!("Type IN ({})", vec!["?"; types.len()].join(",")));
            parameters.extend(types.iter().map(|kind| match kind {
                MessageKind::Wechat(value) => Value::Integer(*value),
                MessageKind::Error(_) => Value::Text("OMW_ERROR".into()),
            }));
        }
    }
    if let Some(types) = &request.type_app {
        let types = types.values();
        if !types.is_empty() {
            clauses.push(format!(
                "({})",
                vec!["Message LIKE ?"; types.len()].join(" OR ")
            ));
            parameters.extend(
                types
                    .iter()
                    .map(|kind| Value::Text(format!("%<type>{kind}</type>%"))),
            );
        }
    }
    (clauses, parameters)
}

fn where_clause(clauses: &[String]) -> String {
    if clauses.is_empty() {
        String::new()
    } else {
        format!(" WHERE {}", clauses.join(" AND "))
    }
}

fn encode_cursor(row: &MessageRow, condition: Condition) -> String {
    serde_json::to_string(&Cursor {
        condition,
        value: Some(row.date),
        message_local_id: Some(row.local_id.clone()),
    })
    .unwrap()
}

pub(super) fn page(
    databases: &AccountDatabases,
    request: &MessageListRequest,
) -> Result<(Vec<MessageRow>, PageMeta), BackupError> {
    let cursor: Option<Cursor> = request
        .cursor
        .as_deref()
        .map(serde_json::from_str)
        .transpose()
        .map_err(|error| BackupError::context("Cannot parse message cursor", error))?;
    let table = table_name(&request.chat.id);
    let Some(database) = source(databases, &table)? else {
        if cursor
            .as_ref()
            .is_some_and(|cursor| cursor.message_local_id.is_some())
        {
            return Err(target_not_found());
        }
        return Ok((Vec::new(), PageMeta::default()));
    };
    let (clauses, parameters) = filters(request);
    let anchor = match cursor.as_ref() {
        Some(cursor)
            if cursor.message_local_id.is_some()
                && (cursor.value.is_none() || matches!(cursor.condition, Condition::Around)) =>
        {
            let mut clauses = clauses.clone();
            let mut parameters = parameters.clone();
            clauses.push("MesLocalID = ?".into());
            parameters.push(Value::Text(cursor.message_local_id.clone().unwrap()));
            let value = database
                .query_row(
                    &format!(
                        "SELECT CreateTime FROM {table}{} LIMIT 1",
                        where_clause(&clauses)
                    ),
                    params_from_iter(&parameters),
                    |row| row.get(0),
                )
                .optional()
                .map_err(query_error)?
                .ok_or_else(target_not_found)?;
            Some(Anchor {
                value,
                message_local_id: cursor.message_local_id.clone(),
            })
        }
        Some(cursor) => cursor.value.map(|value| Anchor {
            value,
            message_local_id: cursor.message_local_id.clone(),
        }),
        None => None,
    };
    let read = |condition: Condition| -> Result<(Vec<MessageRow>, bool), BackupError> {
        let mut clauses = clauses.clone();
        let mut parameters = parameters.clone();
        if let Some(anchor) = &anchor {
            if let Some(id) = &anchor.message_local_id {
                clauses.push(format!(
                    "(CreateTime {} ? OR (CreateTime = ? AND MesLocalID {} ?))",
                    if condition.before() { "<" } else { ">" },
                    condition.operator()
                ));
                parameters.extend([
                    Value::Integer(anchor.value),
                    Value::Integer(anchor.value),
                    Value::Text(id.clone()),
                ]);
            } else {
                clauses.push(format!("CreateTime {} ?", condition.operator()));
                parameters.push(Value::Integer(anchor.value));
            }
        }
        let order = if condition.before() { "DESC" } else { "ASC" };
        parameters.push(Value::Integer((request.limit + 1) as i64));
        let mut statement = database.prepare(&format!("SELECT {COLUMNS} FROM {table}{} ORDER BY CreateTime {order}, MesLocalID {order} LIMIT ?", where_clause(&clauses))).map_err(query_error)?;
        let mut rows = statement
            .query_map(params_from_iter(&parameters), MessageRow::read)
            .map_err(query_error)?
            .collect::<Result<Vec<_>, _>>()
            .map_err(query_error)?;
        let has_more = rows.len() > request.limit;
        rows.truncate(request.limit);
        if condition.before() {
            rows.reverse();
        }
        Ok((rows, has_more))
    };
    let condition = cursor
        .as_ref()
        .map_or(Condition::Before, |cursor| cursor.condition);
    let (data, has_previous, has_next) = if matches!(condition, Condition::Around) {
        let (mut before, has_previous) = read(Condition::Before)?;
        let (after, has_next) = read(Condition::AfterInclusive)?;
        before.extend(after);
        (before, has_previous, has_next)
    } else {
        let (data, has_more) = read(condition)?;
        (
            data,
            if condition.before() { has_more } else { true },
            if condition.before() {
                cursor.is_some()
            } else {
                has_more
            },
        )
    };
    let meta = PageMeta {
        cursor: request.cursor.clone().or_else(|| {
            data.first()
                .map(|row| encode_cursor(row, Condition::AfterInclusive))
        }),
        previous_cursor: data
            .first()
            .filter(|_| has_previous)
            .map(|row| encode_cursor(row, Condition::Before)),
        next_cursor: data
            .last()
            .filter(|_| has_next)
            .map(|row| encode_cursor(row, Condition::After)),
    };
    Ok((data, meta))
}

pub(super) fn find(databases: &AccountDatabases, chat_id: &str, ids: &[String]) -> Vec<MessageRow> {
    let table = table_name(chat_id);
    let sql = format!(
        "SELECT {COLUMNS} FROM {table} WHERE MesSvrID IN ({})",
        vec!["?"; ids.len()].join(",")
    );
    databases
        .message
        .iter()
        .flat_map(|database| {
            // The web reply lookup ignores failed queries (including absent tables)
            // and concatenates successful databases in their original order.
            let query = || -> rusqlite::Result<Vec<MessageRow>> {
                let mut statement = database.prepare(&sql)?;
                let rows = statement
                    .query_map(params_from_iter(ids), MessageRow::read)?
                    .collect();
                rows
            };
            query().unwrap_or_default()
        })
        .collect()
}

fn target_not_found() -> BackupError {
    BackupError::new("Error", "Message target not found")
}
fn query_error(error: rusqlite::Error) -> BackupError {
    BackupError::context("Cannot read messages", error)
}
