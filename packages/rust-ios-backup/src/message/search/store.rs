use super::{text::Query, Request};
use crate::errors::BackupError;
use rusqlite::{params, params_from_iter, types::Value, Connection};

pub(super) struct Document {
    pub chat_id: String,
    pub sender_id: String,
    pub message_local_id: String,
    pub create_time: i64,
    pub message_plain_text: String,
}

pub(super) struct Hit {
    pub document: Document,
    pub relevance: f64,
    pub match_count: Option<usize>,
}

pub(super) struct Store {
    database: Connection,
}

impl Store {
    pub fn new() -> Result<Self, BackupError> {
        let database = Connection::open_in_memory().map_err(error)?;
        database.execute_batch(
            "CREATE VIRTUAL TABLE messageBodyFullTextIndex USING fts5(tokenizedBody, content='');
            CREATE TABLE messageSearchMetadata (
                rowid INTEGER PRIMARY KEY, chatId TEXT NOT NULL, senderId TEXT NOT NULL,
                messageLocalId TEXT NOT NULL, createTime INTEGER NOT NULL, messagePlainText TEXT NOT NULL
            );
            CREATE INDEX messageSearchMetadataChatIdIndex ON messageSearchMetadata(chatId);
            BEGIN;"
        ).map_err(error)?;
        Ok(Self { database })
    }

    pub fn insert(
        &self,
        rowid: usize,
        document: &Document,
        tokens: &str,
    ) -> Result<(), BackupError> {
        self.database
            .prepare_cached(
                "INSERT INTO messageBodyFullTextIndex (rowid, tokenizedBody) VALUES (?, ?)",
            )
            .map_err(error)?
            .execute(params![rowid as i64, tokens])
            .map_err(error)?;
        self.database.prepare_cached("INSERT INTO messageSearchMetadata (rowid, chatId, senderId, messageLocalId, createTime, messagePlainText) VALUES (?, ?, ?, ?, ?, ?)").map_err(error)?
            .execute(params![rowid as i64, document.chat_id, document.sender_id, document.message_local_id, document.create_time, document.message_plain_text]).map_err(error)?;
        Ok(())
    }

    pub fn commit(&self) -> Result<(), BackupError> {
        self.database.execute_batch("COMMIT").map_err(error)
    }

    pub fn search(
        &self,
        request: &Request,
        query: &Query,
    ) -> Result<(Vec<Hit>, usize), BackupError> {
        let mut condition = "messageBodyFullTextIndex MATCH ?".to_owned();
        let mut parameters = vec![Value::Text(query.expression.clone())];
        let chat = request.chat.as_ref().filter(|chat| !chat.id.is_empty());
        if let Some(chat) = chat {
            condition.push_str(" AND m.chatId = ?");
            parameters.push(Value::Text(chat.id.clone()));
        }
        if let Some(time) = request.start_time {
            condition.push_str(" AND m.createTime >= ?");
            parameters.push(Value::Integer(time));
        }
        if let Some(time) = request.end_time {
            condition.push_str(" AND m.createTime <= ?");
            parameters.push(Value::Integer(time));
        }
        let from = "FROM messageBodyFullTextIndex JOIN messageSearchMetadata m ON m.rowid = messageBodyFullTextIndex.rowid";
        let count = if chat.is_some() {
            "count(*)"
        } else {
            "count(DISTINCT m.chatId)"
        };
        let total: usize = self
            .database
            .query_row(
                &format!("SELECT {count} {from} WHERE {condition}"),
                params_from_iter(&parameters),
                |row| row.get::<_, i64>(0).map(|value| value as usize),
            )
            .map_err(error)?;
        parameters.push(Value::Integer(request.limit as i64));
        parameters.push(Value::Integer(request.offset as i64));
        let sql = if chat.is_some() {
            format!("SELECT m.chatId, m.senderId, m.messageLocalId, m.createTime, m.messagePlainText, messageBodyFullTextIndex.rank, NULL {from} WHERE {condition} ORDER BY messageBodyFullTextIndex.rank, m.createTime DESC, m.rowid LIMIT ? OFFSET ?")
        } else {
            format!("WITH ranked AS (
                SELECT m.rowid, m.createTime, messageBodyFullTextIndex.rank AS relevance,
                    count(*) OVER (PARTITION BY m.chatId) AS matchCount,
                    row_number() OVER (PARTITION BY m.chatId ORDER BY messageBodyFullTextIndex.rank, m.createTime DESC, m.rowid) AS position
                {from} WHERE {condition}
            ), page AS (
                SELECT rowid, relevance, matchCount FROM ranked WHERE position = 1
                ORDER BY relevance, createTime DESC, rowid LIMIT ? OFFSET ?
            )
            SELECT m.chatId, m.senderId, m.messageLocalId, m.createTime, m.messagePlainText, page.relevance, page.matchCount
            FROM page JOIN messageSearchMetadata m ON m.rowid = page.rowid
            ORDER BY page.relevance, m.createTime DESC, m.rowid")
        };
        let mut statement = self.database.prepare(&sql).map_err(error)?;
        let hits = statement
            .query_map(params_from_iter(&parameters), |row| {
                Ok(Hit {
                    document: Document {
                        chat_id: row.get(0)?,
                        sender_id: row.get(1)?,
                        message_local_id: row.get(2)?,
                        create_time: row.get(3)?,
                        message_plain_text: row.get(4)?,
                    },
                    relevance: row.get(5)?,
                    match_count: row.get::<_, Option<i64>>(6)?.map(|value| value as usize),
                })
            })
            .map_err(error)?
            .collect::<Result<Vec<_>, _>>()
            .map_err(error)?;
        Ok((hits, total))
    }
}

fn error(error: rusqlite::Error) -> BackupError {
    BackupError::context("Cannot query message search index", error)
}
