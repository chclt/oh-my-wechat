use super::{find, query_error, Contact};
use crate::{account::Account, errors::BackupError};
use rusqlite::{params_from_iter, Connection};
use std::collections::{HashMap, HashSet};

pub(crate) struct Identity {
    pub username: Option<String>,
    pub encoded_username: Option<String>,
}

pub(crate) fn resolve(
    db: &Connection,
    account: &Account,
    identities: &[Identity],
) -> Result<Vec<Option<Contact>>, BackupError> {
    if identities.is_empty() {
        return Ok(Vec::new());
    }
    let mut seen = HashSet::new();
    let mut ids: Vec<String> = identities
        .iter()
        .flat_map(|identity| [&identity.username, &identity.encoded_username])
        .flatten()
        .filter(|id| !id.is_empty() && seen.insert((*id).clone()))
        .cloned()
        .collect();
    let placeholders = (1..=ids.len())
        .map(|index| format!("?{index}"))
        .collect::<Vec<_>>()
        .join(",");
    let sql = format!("SELECT username, encodeUserName FROM Friend WHERE encodeUserName IN ({placeholders}) UNION ALL SELECT username, encodeUserName FROM OpenIMContact WHERE encodeUserName IN ({placeholders})");
    let mut statement = db.prepare(&sql).map_err(query_error)?;
    let encoded_contacts = statement
        .query_map(params_from_iter(&ids), |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(query_error)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(query_error)?;
    for (username, _) in &encoded_contacts {
        if seen.insert(username.clone()) {
            ids.push(username.clone());
        }
    }
    let contacts: HashMap<_, _> = find(db, account, &ids)?
        .into_iter()
        // The web identity resolver excludes chatrooms, which have no username.
        .filter(|contact| contact.account.username.is_some())
        .map(|contact| {
            (
                contact.account.id.clone().expect("contact has an id"),
                contact,
            )
        })
        .collect();
    let encoded_users: HashMap<_, _> = encoded_contacts
        .iter()
        .map(|(username, encoded)| (encoded.as_str(), contacts.get(username)))
        .collect();
    Ok(identities
        .iter()
        .map(|identity| {
            identity
                .username
                .as_ref()
                .and_then(|username| contacts.get(username))
                .or_else(|| {
                    identity
                        .username
                        .as_deref()
                        .and_then(|username| encoded_users.get(username).copied().flatten())
                })
                .or_else(|| {
                    identity
                        .encoded_username
                        .as_deref()
                        .and_then(|username| encoded_users.get(username).copied().flatten())
                })
                .cloned()
        })
        .collect())
}
