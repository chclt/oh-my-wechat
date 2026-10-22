mod session;
mod source;
mod store;
mod text;

use super::query::Identifier;
use crate::{
    chat::{self, Chat},
    contact::{self, Contact},
    errors::BackupError,
    state::BackupState,
};
use serde::{Deserialize, Serialize};
pub(crate) use session::{Session, Status};
use std::collections::HashMap;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct Request {
    pub(crate) account: Identifier,
    chat: Option<Identifier>,
    search_text: Option<String>,
    // Converted by the TS adapter with the same parseISO/getUnixTime as the web.
    start_time: Option<i64>,
    end_time: Option<i64>,
    offset: usize,
    limit: usize,
    // request.user is not implemented by the web adapter either.
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Hit {
    chat: Chat,
    from: Contact,
    message_local_id: String,
    create_time: i64,
    message_plain_text: String,
    #[serde(rename = "match")]
    matched: text::Match,
    relevance: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    match_count: Option<usize>,
}

#[derive(Serialize)]
pub(crate) struct Response {
    data: Vec<Hit>,
    meta: Meta,
}

#[derive(Serialize)]
struct Meta {
    total: usize,
    offset: usize,
    limit: usize,
}

pub(crate) fn search(state: &BackupState, request: &Request) -> Result<Response, BackupError> {
    let session = state.search_session(&request.account.id)?.ok_or_else(|| {
        BackupError::new("AccountNotLoadedError", "Account database is not loaded")
    })?;
    let (hits, total) = session.search(state, request)?;
    state.with_search_account(session.generation, |databases| {
        let mut chat_ids = hits
            .iter()
            .map(|hit| hit.document.chat_id.clone())
            .collect::<Vec<_>>();
        chat_ids.sort();
        chat_ids.dedup();
        let mut sender_ids = hits
            .iter()
            .map(|hit| hit.document.sender_id.clone())
            .collect::<Vec<_>>();
        sender_ids.sort();
        sender_ids.dedup();
        let chats: HashMap<_, _> = chat::list(databases, Some(&chat_ids))?
            .data
            .into_iter()
            .map(|chat| (chat.id.clone(), chat))
            .collect();
        let users: HashMap<_, _> =
            contact::find(&databases.contact, &databases.account, &sender_ids)?
                .into_iter()
                .map(|contact| {
                    (
                        contact.account.id.clone().expect("contact has an id"),
                        contact,
                    )
                })
                .collect();
        let query = text::Query::new(request.search_text.as_deref().unwrap_or_default());
        let data = hits
            .into_iter()
            .map(|hit| {
                let document = hit.document;
                Hit {
                    chat: chats
                        .get(&document.chat_id)
                        .expect("indexed chat exists in the account")
                        .clone(),
                    from: users
                        .get(&document.sender_id)
                        .cloned()
                        .unwrap_or_else(|| Contact::unknown_sender(&document.sender_id)),
                    matched: query
                        .as_ref()
                        .expect("nonempty search has a query")
                        .find_match(&document.message_plain_text),
                    message_local_id: document.message_local_id,
                    create_time: document.create_time,
                    message_plain_text: document.message_plain_text,
                    relevance: hit.relevance,
                    match_count: hit.match_count,
                }
            })
            .collect();
        Ok(Response {
            data,
            meta: Meta {
                total,
                offset: request.offset,
                limit: request.limit,
            },
        })
    })
}
