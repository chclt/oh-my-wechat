use super::{list, Chat};
use crate::{account::database::AccountDatabases, contact, errors::BackupError};
use icu_casemap::CaseMapper;
use icu_locale_core::LanguageIdentifier;
use icu_normalizer::ComposingNormalizer;
use std::{
    collections::{HashMap, HashSet},
    sync::OnceLock,
};

// Same data as @repo/utils/specialBrandIds; do not maintain a second copy.
static SPECIAL_BRAND_IDS: OnceLock<HashSet<&str>> = OnceLock::new();
// Keep these exclusions aligned with utils/src/isChatVisible.ts.
const IGNORED_CHAT_IDS: &[&str] = &[
    "brandsessionholder",
    "brandservicesessionholder",
    "notification_messages",
    "brandsessionholder_weapp",
    "opencustomerservicemsg",
    "newsapp",
    "masssendapp",
];

#[derive(serde::Serialize)]
pub(crate) struct ChatSearchResult {
    data: Vec<Chat>,
    meta: ChatSearchMeta,
}

#[derive(serde::Serialize)]
struct ChatSearchMeta {
    total: usize,
    offset: usize,
    limit: usize,
}

// ECMAScript trim/\s includes BOM and excludes U+0085, unlike Rust whitespace.
fn is_whitespace(character: char) -> bool {
    matches!(character,
        '\u{0009}'..='\u{000d}' | ' ' | '\u{00a0}' | '\u{1680}' |
        '\u{2000}'..='\u{200a}' | '\u{2028}' | '\u{2029}' | '\u{202f}' |
        '\u{205f}' | '\u{3000}' | '\u{feff}'
    )
}

fn normalize(value: Option<&str>, language: &LanguageIdentifier) -> String {
    let normalized = ComposingNormalizer::new_nfkc().normalize(value.unwrap_or_default());
    CaseMapper::new()
        .lowercase_to_string(normalized.trim_matches(is_whitespace), language)
        .into_owned()
}

fn compact(value: &str) -> String {
    value.chars().filter(|c| !is_whitespace(*c)).collect()
}

pub(crate) fn search(
    databases: &AccountDatabases,
    query: &str,
    offset: usize,
    limit: usize,
    language: &LanguageIdentifier,
) -> Result<ChatSearchResult, BackupError> {
    let query = normalize(Some(query), language);
    if query.is_empty() {
        return Ok(ChatSearchResult {
            data: Vec::new(),
            meta: ChatSearchMeta {
                total: 0,
                offset,
                limit,
            },
        });
    }
    let chats = list(databases, None)?.data;
    let contacts: HashMap<_, _> = contact::list(&databases.contact)?
        .data
        .into_iter()
        .map(|contact| (contact.id.clone(), contact))
        .collect();
    let special_brand_ids = SPECIAL_BRAND_IDS.get_or_init(|| {
        include_str!("../../../utils/src/assets/specialBrandUserNames.csv")
            .split('\n')
            .map(|id| id.trim_matches(is_whitespace))
            .collect()
    });
    let compact_query = compact(&query);
    let matches: Vec<_> = chats
        .into_iter()
        .filter(|chat| {
            if chat.id.ends_with("@openim")
                || special_brand_ids.contains(chat.id.as_str())
                || IGNORED_CHAT_IDS.contains(&chat.id.as_str())
                || chat.is_collapsed
                || chat.id.starts_with("gh_")
            {
                return false;
            }
            let contact = if chat.kind == "private" {
                &chat.user
            } else {
                &chat.chatroom
            };
            let values = [
                chat.title.as_deref(),
                contact
                    .as_ref()
                    .and_then(|contact| contact.remark.as_deref()),
                contact.as_ref().and_then(|contact| {
                    if chat.kind == "private" {
                        contact.account.username.as_deref()
                    } else {
                        contact.title.as_deref()
                    }
                }),
            ];
            if values
                .into_iter()
                .any(|value| normalize(value, language).contains(&query))
            {
                return true;
            }
            let Some(contact) = contacts.get(&chat.id) else {
                return false;
            };
            [
                Some(contact.username_pinyin.as_str()),
                contact.remark_pinyin.as_deref(),
                contact.remark_pinyin_inits.as_deref(),
            ]
            .into_iter()
            .any(|value| compact(&normalize(value, language)).contains(&compact_query))
        })
        .collect();
    let total = matches.len();
    Ok(ChatSearchResult {
        data: matches.into_iter().skip(offset).take(limit).collect(),
        meta: ChatSearchMeta {
            total,
            offset,
            limit,
        },
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalization_matches_javascript_unicode_vectors() {
        // Independent expected strings from normalize("NFKC").trim().toLocaleLowerCase(language).
        for (language, input, expected) in [
            ("en", "\u{feff} ＡＬＩＣＥ \u{feff}", "alice"),
            ("en", "ΟΣ", "ος"),
            ("en", "İ", "i\u{307}"),
            ("tr", "I", "ı"),
            ("tr", "İ", "i"),
            ("lt", "I\u{301}", "i\u{307}\u{301}"),
            ("en", "\u{85}Ａ\u{85}", "\u{85}a\u{85}"),
        ] {
            assert_eq!(normalize(Some(input), &language.parse().unwrap()), expected);
        }
    }
}
