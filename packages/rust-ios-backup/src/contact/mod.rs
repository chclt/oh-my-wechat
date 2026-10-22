mod identity;
mod proto;

pub(crate) use identity::{resolve as resolve_identities, Identity};

use crate::{
    account::{Account, Photo},
    errors::BackupError,
};
use prost::Message;
use rusqlite::{params_from_iter, Connection};
use std::collections::HashMap;

const COLUMNS: &str = "username, type, dbContactProfile, dbContactHeadImage, dbContactRemark, dbContactSocial, dbContactChatRoom, dbContactOpenIM";

struct ContactRow {
    id: String,
    flags: i64,
    profile: proto::Profile,
    head: proto::HeadImage,
    remark: proto::Remark,
    social: proto::Social,
    room: Option<proto::ChatRoom>,
    openim: Option<proto::OpenIM>,
}

impl ContactRow {
    fn read(row: &rusqlite::Row<'_>) -> Result<Self, BackupError> {
        Ok(Self {
            id: row.get(0).map_err(query_error)?,
            flags: row.get(1).map_err(query_error)?,
            profile: decode(row.get(2).map_err(query_error)?, "dbContactProfile")?,
            head: decode(row.get(3).map_err(query_error)?, "dbContactHeadImage")?,
            remark: decode(row.get(4).map_err(query_error)?, "dbContactRemark")?,
            social: decode(row.get(5).map_err(query_error)?, "dbContactSocial")?,
            room: row
                .get::<_, Option<Vec<u8>>>(6)
                .map_err(query_error)?
                .map(|bytes| decode(bytes, "dbContactChatRoom"))
                .transpose()?,
            openim: row
                .get::<_, Option<Vec<u8>>>(7)
                .map_err(query_error)?
                .map(|bytes| decode(bytes, "dbContactOpenIM"))
                .transpose()?,
        })
    }
}

#[derive(serde::Serialize)]
pub(crate) struct ContactList {
    pub(crate) data: Vec<ContactListItem>,
}

#[derive(serde::Serialize)]
pub(crate) struct ContactListItem {
    pub(crate) id: String,
    username: String,
    #[serde(rename = "usernamePinyin")]
    pub(crate) username_pinyin: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    remark: Option<String>,
    #[serde(rename = "remarkPinyin", skip_serializing_if = "Option::is_none")]
    pub(crate) remark_pinyin: Option<String>,
    #[serde(rename = "remarkPinyinInits", skip_serializing_if = "Option::is_none")]
    pub(crate) remark_pinyin_inits: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    photo: Option<Photo>,
    is_openim: bool,
}

// The common account fields retain absent values; contact protobuf strings,
// in contrast, use the defaults defined by contact.proto in the web adapter.
#[derive(Clone, Default, serde::Serialize)]
pub(crate) struct Contact {
    #[serde(flatten)]
    pub(crate) account: Account,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) remark: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    is_openim: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) _is_pinned: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) _is_collapsed: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    _member_ids: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) members: Option<Vec<Contact>>,
}

impl From<Account> for Contact {
    fn from(account: Account) -> Self {
        Self {
            account,
            ..Self::default()
        }
    }
}

impl Contact {
    pub(crate) fn unknown_sender(id: &str) -> Self {
        Self {
            account: Account {
                id: Some(id.to_owned()),
                user_id: Some(id.to_owned()),
                username: Some(id.to_owned()),
                ..Account::default()
            },
            is_openim: Some(false),
            ..Self::default()
        }
    }
}

fn decode<T: Message + Default>(bytes: Vec<u8>, column: &str) -> Result<T, BackupError> {
    T::decode(bytes.as_slice()).map_err(|error| {
        BackupError::context(format!("Cannot decode contact protobuf: {column}"), error)
    })
}

fn nonempty(value: Option<String>) -> Option<String> {
    value.filter(|text| !text.is_empty())
}

pub(crate) fn list(db: &Connection) -> Result<ContactList, BackupError> {
    let sql = format!("SELECT {COLUMNS} FROM Friend WHERE (type & 1) != 0 UNION ALL SELECT {COLUMNS} FROM OpenIMContact WHERE (type & 1) != 0");
    let mut statement = db.prepare(&sql).map_err(query_error)?;
    let mut rows = statement.query([]).map_err(query_error)?;
    let mut data = Vec::new();
    while let Some(row) = rows.next().map_err(query_error)? {
        let contact = ContactRow::read(row)?;
        data.push(ContactListItem {
            id: contact.id,
            username: contact.remark.nickname.unwrap_or_default(),
            username_pinyin: contact.remark.nickname_pinyin.unwrap_or_default(),
            remark: nonempty(contact.remark.remark),
            remark_pinyin: nonempty(contact.remark.remark_pinyin),
            remark_pinyin_inits: nonempty(contact.remark.remark_pinyin_inits),
            photo: nonempty(contact.head.head_image_thumb).map(|thumb| Photo {
                thumb,
                origin: None,
            }),
            is_openim: contact.openim.is_some(),
        });
    }
    Ok(ContactList { data })
}

pub(crate) fn find(
    db: &Connection,
    account: &Account,
    ids: &[String],
) -> Result<Vec<Contact>, BackupError> {
    let mut contacts = Vec::new();
    if ids.is_empty() {
        return Ok(contacts);
    }
    if let Some(id) = &account.id {
        if ids.contains(id) {
            contacts.push(account.clone().into());
        }
    }
    let placeholders = (1..=ids.len())
        .map(|i| format!("?{i}"))
        .collect::<Vec<_>>()
        .join(",");
    let sql = format!("SELECT {COLUMNS} FROM Friend WHERE username IN ({placeholders}) UNION ALL SELECT {COLUMNS} FROM OpenIMContact WHERE username IN ({placeholders})");
    let mut statement = db.prepare(&sql).map_err(query_error)?;
    let mut rows = statement
        .query(params_from_iter(ids))
        .map_err(query_error)?;
    while let Some(row) = rows.next().map_err(query_error)? {
        let ContactRow {
            id,
            flags,
            profile,
            head,
            remark,
            social,
            room,
            openim,
        } = ContactRow::read(row)?;
        let is_room = id.ends_with("@chatroom");
        let mut contact = Contact {
            account: Account {
                id: Some(id),
                photo: nonempty(head.head_image_thumb).map(|thumb| Photo {
                    thumb,
                    origin: None,
                }),
                ..Account::default()
            },
            remark: nonempty(remark.remark),
            is_openim: Some(openim.is_some()),
            _is_pinned: Some(flags & (1 << 11) != 0),
            ..Contact::default()
        };
        if is_room {
            contact.title = Some(nonempty(remark.nickname).unwrap_or_else(|| "群聊".into()));
            contact._is_collapsed = Some(flags & (1 << 28) != 0);
            contact._member_ids = Some(
                room.map(|room| {
                    room.chatroom_member_ids
                        .split(';')
                        .map(str::to_owned)
                        .collect()
                })
                .unwrap_or_default(),
            );
        } else {
            contact.account.user_id = Some(remark.id);
            contact.account.username = Some(remark.nickname.unwrap_or_default());
            contact.account.bio = Some(profile.profile_bio);
            contact.account.background = Some(social.social_background);
            contact.account.phone = nonempty(social.social_phone);
        }
        contacts.push(contact);
    }
    // Match the web controller's member lookup and last-row-wins behavior.
    let mut member_ids = Vec::new();
    for contact in &contacts {
        if let Some(ids) = &contact._member_ids {
            member_ids.extend(ids.iter().cloned());
        }
    }
    member_ids.sort();
    member_ids.dedup();
    let mut members: HashMap<_, _> = find(db, account, &member_ids)?
        .into_iter()
        .map(|contact| {
            (
                contact.account.id.clone().expect("contact has an id"),
                contact,
            )
        })
        .collect();
    if let Some(id) = &account.id {
        if member_ids.contains(id) {
            members.insert(id.clone(), account.clone().into());
        }
    }
    for contact in &mut contacts {
        if let Some(ids) = &contact._member_ids {
            contact.members = Some(
                ids.iter()
                    .filter_map(|id| members.get(id).cloned())
                    .collect(),
            );
        }
    }
    Ok(contacts)
}

fn query_error(error: rusqlite::Error) -> BackupError {
    BackupError::context("Cannot read contacts", error)
}

#[cfg(test)]
mod tests;
