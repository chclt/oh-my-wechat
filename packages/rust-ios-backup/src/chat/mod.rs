mod search;
pub(crate) use search::{search, ChatSearchResult};

use crate::{
    account::database::AccountDatabases,
    contact::{self, Contact},
    errors::BackupError,
};
use rusqlite::params_from_iter;
use std::collections::HashMap;

#[derive(serde::Serialize)]
pub(crate) struct ChatList {
    pub(crate) data: Vec<Chat>,
}

#[derive(serde::Serialize)]
pub(crate) struct Chat {
    #[serde(rename = "type")]
    pub(crate) kind: &'static str,
    id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    photo: Option<String>,
    is_muted: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    is_pinned: Option<bool>,
    is_collapsed: bool,
    // JSON represents an undefined array slot as null. The TS restoreChats helper
    // restores that slot, preserving the web adapter's missing-contact behavior.
    members: Vec<Option<Contact>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    user: Option<Contact>,
    #[serde(skip_serializing_if = "Option::is_none")]
    chatroom: Option<Contact>,
}

pub(crate) fn list(
    databases: &AccountDatabases,
    ids: Option<&[String]>,
) -> Result<ChatList, BackupError> {
    if ids.is_some_and(<[String]>::is_empty) {
        return Ok(ChatList { data: Vec::new() });
    }
    let filter = ids
        .map(|ids| {
            let placeholders = vec!["?"; ids.len()].join(",");
            format!(" WHERE UsrName IN ({placeholders})")
        })
        .unwrap_or_default();
    let mut statement = databases
        .session
        .prepare(&format!(
            "SELECT UsrName, ConIntRes1 FROM SessionAbstract{filter} ORDER BY CreateTime DESC"
        ))
        .map_err(query_error)?;
    let rows = statement
        .query_map(params_from_iter(ids.unwrap_or_default()), |row| {
            // Drizzle's boolean mapping is exactly value === 1, then the chat
            // controller coerces the result to bool (including SQL NULL -> false).
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, Option<i64>>(1)? == Some(1),
            ))
        })
        .map_err(query_error)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(query_error)?;
    let contacts: HashMap<_, _> = contact::find(
        &databases.contact,
        &databases.account,
        &rows.iter().map(|(id, _)| id.clone()).collect::<Vec<_>>(),
    )?
    .into_iter()
    .map(|contact| {
        (
            contact.account.id.clone().expect("contact has an id"),
            contact,
        )
    })
    .collect();
    let data = rows
        .into_iter()
        .map(|(id, muted)| {
            let contact = contacts.get(&id);
            let is_room = id.ends_with("@chatroom");
            let title = match contact {
                Some(contact) => contact.remark.clone().or_else(|| {
                    if is_room {
                        contact.title.clone()
                    } else {
                        contact.account.username.clone()
                    }
                }),
                None => Some(if is_room { "-".into() } else { id.clone() }),
            };
            Chat {
                kind: if is_room { "chatroom" } else { "private" },
                id,
                title,
                photo: contact.and_then(|contact| {
                    contact
                        .account
                        .photo
                        .as_ref()
                        .map(|photo| photo.thumb.clone())
                }),
                is_muted: muted,
                is_pinned: if is_room {
                    Some(
                        contact
                            .and_then(|contact| contact._is_pinned)
                            .unwrap_or(false),
                    )
                } else {
                    contact.map_or(Some(false), |contact| contact._is_pinned)
                },
                is_collapsed: is_room
                    && contact
                        .and_then(|contact| contact._is_collapsed)
                        .unwrap_or(false),
                members: if is_room {
                    contact
                        .and_then(|contact| contact.members.clone())
                        .unwrap_or_default()
                        .into_iter()
                        .map(Some)
                        .collect()
                } else {
                    vec![Some(databases.account.clone().into()), contact.cloned()]
                },
                user: if is_room { None } else { contact.cloned() },
                chatroom: if is_room { contact.cloned() } else { None },
            }
        })
        .collect();
    Ok(ChatList { data })
}

fn query_error(error: rusqlite::Error) -> BackupError {
    BackupError::context("Cannot read chat list", error)
}

#[cfg(test)]
mod tests;
