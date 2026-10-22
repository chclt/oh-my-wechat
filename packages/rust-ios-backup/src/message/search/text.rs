use crate::utils::is_js_whitespace;
use icu_casemap::CaseMapper;
use icu_locale_core::LanguageIdentifier;
use serde::Serialize;

fn lowercase(text: &str) -> String {
    CaseMapper::new()
        .lowercase_to_string(text, &LanguageIdentifier::UNKNOWN)
        .into_owned()
}

pub(super) fn tokenize(text: &str) -> String {
    if text.trim_matches(is_js_whitespace).is_empty() {
        return String::new();
    }
    lowercase(text)
        .chars()
        .map(|character| format!("u{:x}", u32::from(character)))
        .collect::<Vec<_>>()
        .join(" ")
}

#[derive(Serialize)]
pub(super) struct Match {
    start: usize,
    end: usize,
}

pub(super) struct Query {
    normalized: String,
    pub expression: String,
}

impl Query {
    pub fn new(text: &str) -> Option<Self> {
        let normalized = lowercase(text.trim_matches(is_js_whitespace));
        if normalized.is_empty() {
            return None;
        }
        let expression = format!("\"{}\"", tokenize(&normalized));
        Some(Self {
            normalized,
            expression,
        })
    }

    pub fn find_match(&self, text: &str) -> Match {
        let normalized = lowercase(text);
        let byte_start = normalized
            .find(&self.normalized)
            .expect("FTS phrase matches the text");
        let start = normalized[..byte_start].encode_utf16().count();
        let end = start + self.normalized.encode_utf16().count();
        let mut source_offset = 0;
        let mut normalized_offset = 0;
        let mut source_start = 0;
        // Match the web adapter's UTF-16 offsets, including lowercase expansions.
        for character in text.chars() {
            if normalized_offset <= start {
                source_start = source_offset;
            }
            source_offset += character.len_utf16();
            normalized_offset += lowercase(&character.to_string()).encode_utf16().count();
            if normalized_offset >= end {
                return Match {
                    start: source_start,
                    end: source_offset,
                };
            }
        }
        unreachable!("FTS phrase ends within the source text")
    }
}
