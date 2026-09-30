mod query;
mod xml;

pub(crate) use query::MessageListRequest;

use crate::{
    account::database::AccountDatabases,
    chat,
    contact::{self, Contact},
    errors::BackupError,
};
use query::{MessageContent, MessageRow, PageMeta};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

#[derive(Serialize)]
pub(crate) struct MessageList {
    data: Vec<Message>,
    meta: PageMeta,
}

#[derive(Clone, Serialize)]
struct Message {
    id: String,
    local_id: String,
    #[serde(rename = "type")]
    kind: MessageKind,
    date: i64,
    direction: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    from: Option<Contact>,
    chat_id: String,
    raw_message: String,
    message_entity: Value,
    #[serde(flatten)]
    reply: Option<Reply>,
}

#[derive(Clone, Serialize)]
struct Reply {
    // A missing referenced message is an own undefined property in the web
    // adapter. restoreMessages converts this JSON null back to undefined.
    reply_to_message: Option<Box<Message>>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
enum MessageKind {
    Wechat(i64),
    Error(ErrorMessageKind),
}

#[derive(Clone, Deserialize, Serialize)]
enum ErrorMessageKind {
    #[serde(rename = "OMW_ERROR")]
    Unsupported,
}

pub(crate) fn list(
    databases: &AccountDatabases,
    request: &MessageListRequest,
) -> Result<MessageList, BackupError> {
    let (rows, meta) = query::page(databases, request)?;
    if rows.is_empty() {
        return Ok(MessageList {
            data: Vec::new(),
            meta,
        });
    }
    let chats = chat::list(databases, Some(std::slice::from_ref(&request.chat.id)))?;
    let chat = &chats.data[0];
    Ok(MessageList {
        data: parse(rows, databases, &request.chat.id, chat.kind == "chatroom")?,
        meta,
    })
}

fn parse(
    rows: Vec<MessageRow>,
    databases: &AccountDatabases,
    chat_id: &str,
    is_group: bool,
) -> Result<Vec<Message>, BackupError> {
    let account_id = databases
        .account
        .id
        .as_deref()
        .expect("loaded account has an id");
    let mut senders = Vec::with_capacity(rows.len());
    let mut replies = Vec::new();
    let mut messages = Vec::with_capacity(rows.len());
    for (index, row) in rows.into_iter().enumerate() {
        let was_null = matches!(row.content, MessageContent::Null);
        let (mut content, mut kind) = match row.content {
            MessageContent::Null => (String::new(), MessageKind::Wechat(1)),
            MessageContent::Text(content) => (content, MessageKind::Wechat(row.message_type)),
            MessageContent::Blob(bytes) => (
                // Match TextDecoder: strip the BOM and replace invalid UTF-8.
                String::from_utf8_lossy(bytes.strip_prefix(&[0xef, 0xbb, 0xbf]).unwrap_or(&bytes))
                    .into_owned(),
                MessageKind::Error(ErrorMessageKind::Unsupported),
            ),
        };
        // The web null-message branch runs before private/group direction handling.
        let sender_id = if was_null {
            chat_id.to_owned()
        } else {
            sender(
                &mut content,
                &kind,
                row.direction,
                account_id,
                chat_id,
                is_group,
            )?
        };
        let entity = match kind {
            MessageKind::Error(_) => Value::String(format!("不支持: {content}")),
            MessageKind::Wechat(message_type) => match message_type {
                1 | 10000 => Value::String(content.clone()),
                3 | 34 | 35 | 42 | 43 | 47 | 48 | 50 | 62 | 66 | 10002 => {
                    xml::parse(&content, true)?
                }
                49 => {
                    let entity = xml::parse(&content, true)?;
                    if !entity.pointer("/msg/appmsg").is_some_and(truthy) {
                        kind = MessageKind::Error(ErrorMessageKind::Unsupported);
                        Value::String(content.clone())
                    } else {
                        if entity.pointer("/msg/appmsg/type").and_then(Value::as_f64) == Some(57.0)
                        {
                            if let Some(id) = entity
                                .pointer("/msg/appmsg/refermsg/svrid")
                                .and_then(Value::as_str)
                            {
                                replies.push((index, id.to_owned()));
                            }
                        }
                        entity
                    }
                }
                64 => serde_json::from_str(&content).map_err(|error| {
                    BackupError::context("Cannot parse group call message", error)
                })?,
                _ => Value::String(format!("不支持: {}", content)),
            },
        };
        messages.push(Message {
            id: row.id,
            local_id: row.local_id,
            kind,
            date: row.date,
            direction: if sender_id.is_empty() {
                row.direction
            } else {
                i64::from(sender_id != account_id)
            },
            from: None,
            chat_id: chat_id.to_owned(),
            raw_message: content,
            message_entity: entity,
            reply: None,
        });
        senders.push(sender_id);
    }
    let users: HashMap<_, _> = contact::find(&databases.contact, &databases.account, &senders)?
        .into_iter()
        .map(|user| (user.account.id.clone().expect("contact has an id"), user))
        .collect();
    for (message, sender_id) in messages.iter_mut().zip(senders) {
        message.from = users.get(&sender_id).cloned().or_else(|| {
            if sender_id.is_empty() {
                None
            } else {
                Some(Contact::unknown_sender(&sender_id))
            }
        });
    }
    if !replies.is_empty() {
        let ids = replies.iter().map(|(_, id)| id.clone()).collect::<Vec<_>>();
        let references: HashMap<_, _> = parse(
            query::find(databases, chat_id, &ids),
            databases,
            chat_id,
            is_group,
        )?
        .into_iter()
        .map(|message| (message.id.clone(), message))
        .collect();
        for (index, id) in replies {
            messages[index].reply = Some(Reply {
                reply_to_message: references.get(&id).cloned().map(Box::new),
            });
        }
    }
    Ok(messages)
}

fn sender(
    content: &mut String,
    kind: &MessageKind,
    direction: i64,
    account_id: &str,
    chat_id: &str,
    is_group: bool,
) -> Result<String, BackupError> {
    if !is_group {
        return Ok(if direction == 1 { chat_id } else { account_id }.to_owned());
    }
    if direction == 0 {
        return Ok(account_id.to_owned());
    }
    if matches!(kind, MessageKind::Wechat(10000))
        || content.starts_with('<')
        || content.starts_with("\"<")
    {
        let entity = xml::parse(content, false)?;
        if let Some(sender) = entity
            .pointer("/msg/fromusername")
            .and_then(Value::as_str)
            .filter(|sender| !sender.is_empty())
        {
            return Ok(sender.to_owned());
        }
        if matches!(kind, MessageKind::Wechat(43)) {
            return entity
                .pointer("/msg/videomsg/@_fromusername")
                .and_then(Value::as_str)
                .map(str::to_owned)
                .ok_or_else(|| BackupError::new("Error", "Video message sender is missing"));
        }
        return Ok(String::new());
    }
    if let Some(position) = content.find(":\n") {
        let sender = content[..position].to_owned();
        *content = content[position + 2..].to_owned();
        Ok(sender)
    } else {
        // Preserve splitGroupMessageContent's slice(0, -1) / slice(1) behavior.
        let units = content.encode_utf16().collect::<Vec<_>>();
        let sender = String::from_utf16_lossy(&units[..units.len().saturating_sub(1)]);
        *content = String::from_utf16_lossy(&units[units.len().min(1)..]);
        Ok(sender)
    }
}

fn truthy(value: &Value) -> bool {
    match value {
        Value::Null => false,
        Value::Bool(value) => *value,
        Value::Number(value) => value.as_f64() != Some(0.0),
        Value::String(value) => !value.is_empty(),
        Value::Array(_) | Value::Object(_) => true,
    }
}

#[cfg(test)]
mod tests;
