use crate::{errors::BackupError, utils::is_js_whitespace};
use quick_xml::{
    events::{BytesStart, Event},
    Reader,
};
use regex::Regex;
use serde_json::{Map, Value};
use std::sync::OnceLock;

// These paths use the web controller's tagValueProcessor, retaining strings
// even when their contents look like numbers or booleans.
const STRING_PATHS: &[&str] = &[
    "msg.appmsg.title",
    "msg.appmsg.des",
    "msg.appmsg.refermsg.svrid",
    "msg.appmsg.refermsg.displayname",
    "msg.appmsg.refermsg.content",
];

struct Node {
    name: String,
    path: String,
    fields: Map<String, Value>,
    pending_text: String,
    text: Option<Value>,
}

impl Node {
    fn new(name: String, path: String, fields: Map<String, Value>) -> Self {
        Self {
            name,
            path,
            fields,
            pending_text: String::new(),
            text: None,
        }
    }

    fn add_text(&mut self, text: &str, cdata: bool, preserve_strings: bool) {
        let value = if cdata {
            text.to_owned()
        } else {
            unescape(text.trim_matches(is_js_whitespace))
        };
        if value.is_empty() && !cdata {
            return;
        }
        let value =
            if value.is_empty() || preserve_strings && STRING_PATHS.contains(&self.path.as_str()) {
                Value::String(value)
            } else {
                scalar(&value)
            };
        self.text = Some(match self.text.take() {
            None => value,
            Some(previous) => {
                Value::String(format!("{}{}", text_value(&previous), text_value(&value)))
            }
        });
    }

    fn flush_text(&mut self, preserve_strings: bool) {
        let text = std::mem::take(&mut self.pending_text);
        self.add_text(&text, false, preserve_strings)
    }

    fn finish(mut self) -> Value {
        if let Some(text) = self.text {
            if text != Value::String(String::new()) {
                self.fields.insert("#text".into(), text);
            }
        }
        if self.fields.is_empty() {
            Value::String(String::new())
        } else if self.fields.len() == 1 && self.fields.contains_key("#text") {
            self.fields.remove("#text").unwrap()
        } else {
            Value::Object(self.fields)
        }
    }
}

fn text_value(value: &Value) -> String {
    match value {
        Value::String(value) => value.clone(),
        Value::Number(value) => ryu_js::Buffer::new()
            .format(value.as_f64().unwrap())
            .to_owned(),
        _ => value.to_string(),
    }
}

fn insert(fields: &mut Map<String, Value>, name: String, value: Value) {
    use serde_json::map::Entry;
    match fields.entry(name) {
        Entry::Vacant(entry) => {
            entry.insert(value);
        }
        Entry::Occupied(mut entry) => match entry.get_mut() {
            Value::Array(values) => values.push(value),
            previous => {
                *previous = Value::Array(vec![previous.take(), value]);
            }
        },
    }
}

fn attributes(element: &BytesStart<'_>) -> Result<Map<String, Value>, BackupError> {
    let mut fields = Map::new();
    for attribute in element.attributes().with_checks(false) {
        let attribute = attribute.map_err(xml_error)?;
        fields.insert(
            format!("@_{}", attribute.key.0),
            Value::String(unescape(attribute.value.trim_matches(is_js_whitespace))),
        );
    }
    Ok(fields)
}

pub(super) fn parse(input: &str, preserve_strings: bool) -> Result<Value, BackupError> {
    // fast-xml-parser normalizes line endings before processing text and CDATA.
    let input = input.replace("\r\n", "\n").replace('\r', "\n");
    let mut reader = Reader::from_str(&input);
    // Like the web parser, accept mismatched closing tags and literal ampersands.
    reader.config_mut().check_end_names = false;
    reader.config_mut().allow_dangling_amp = true;
    let mut stack = vec![Node::new(String::new(), String::new(), Map::new())];
    loop {
        let event = reader.read_event().map_err(xml_error)?;
        let empty = matches!(event, Event::Empty(_));
        match event {
            Event::Start(element) | Event::Empty(element) => {
                let parent = stack.last_mut().unwrap();
                parent.flush_text(preserve_strings);
                let name = element.name().0.to_owned();
                let path = if parent.path.is_empty() {
                    name.clone()
                } else {
                    format!("{}.{}", parent.path, name)
                };
                let node = Node::new(name.clone(), path, attributes(&element)?);
                if empty {
                    insert(&mut parent.fields, name, node.finish());
                } else {
                    stack.push(node);
                }
            }
            Event::End(_) => {
                let mut node = stack.pop().unwrap();
                node.flush_text(preserve_strings);
                let name = node.name.clone();
                insert(&mut stack.last_mut().unwrap().fields, name, node.finish());
            }
            Event::Text(text) => {
                if stack.len() > 1 {
                    stack.last_mut().unwrap().pending_text.push_str(&text);
                }
            }
            Event::GeneralRef(reference) => {
                if stack.len() > 1 {
                    stack
                        .last_mut()
                        .unwrap()
                        .pending_text
                        .push_str(&format!("&{};", reference.as_ref()));
                }
            }
            Event::CData(text) => {
                let node = stack.last_mut().unwrap();
                node.flush_text(preserve_strings);
                node.add_text(&text, true, preserve_strings);
            }
            Event::Decl(declaration) => {
                let node = stack.last_mut().unwrap();
                node.flush_text(preserve_strings);
                let element = BytesStart::from_content(declaration.as_ref(), 3);
                insert(
                    &mut node.fields,
                    "?xml".into(),
                    Node::new(String::new(), String::new(), attributes(&element)?).finish(),
                );
            }
            Event::PI(instruction) => {
                let node = stack.last_mut().unwrap();
                node.flush_text(preserve_strings);
                let element =
                    BytesStart::from_content(instruction.as_ref(), instruction.target().len());
                insert(
                    &mut node.fields,
                    format!("?{}", instruction.target()),
                    Node::new(String::new(), String::new(), attributes(&element)?).finish(),
                );
            }
            Event::Comment(_) => {}
            Event::DocType(_) => {}
            Event::Eof => break,
        }
    }
    // fast-xml-parser retains unclosed nodes but does not flush their trailing text.
    while stack.len() > 1 {
        let node = stack.pop().unwrap();
        let name = node.name.clone();
        insert(&mut stack.last_mut().unwrap().fields, name, node.finish());
    }
    Ok(Value::Object(stack.pop().unwrap().fields))
}

fn unescape(input: &str) -> String {
    // fast-xml-parser's default htmlEntities=false only decodes these five
    // entities and their exact numeric aliases. Other references stay literal.
    static ENTITIES: OnceLock<[(Regex, &str); 5]> = OnceLock::new();
    let entities = ENTITIES.get_or_init(|| {
        [
            (r"&(apos|#39|#x27);", "'"),
            (r"&(gt|#62|#x3E);", ">"),
            (r"&(lt|#60|#x3C);", "<"),
            (r"&(quot|#34|#x22);", "\""),
            (r"&(amp|#38|#x26);", "&"),
        ]
        .map(|(pattern, replacement)| (Regex::new(pattern).unwrap(), replacement))
    });
    let mut value = input.to_owned();
    for (pattern, replacement) in entities {
        value = pattern.replace_all(&value, *replacement).into_owned();
    }
    value
}

fn scalar(input: &str) -> Value {
    let trimmed = input.trim_matches(is_js_whitespace);
    match trimmed {
        "" => return Value::from(0.0),
        "true" => return Value::Bool(true),
        "false" => return Value::Bool(false),
        _ => {}
    }
    static DECIMAL: OnceLock<Regex> = OnceLock::new();
    static EXPONENT: OnceLock<Regex> = OnceLock::new();
    static HEX: OnceLock<Regex> = OnceLock::new();
    let decimal = DECIMAL.get_or_init(|| Regex::new(r"^([-+])?(0*)([0-9]*(\.[0-9]*)?)$").unwrap());
    let exponent =
        EXPONENT.get_or_init(|| Regex::new(r"^([-+])?(0*)(\d*(\.\d*)?[eE][-+]?\d+)$").unwrap());
    let hex = HEX.get_or_init(|| Regex::new(r"^[-+]?0x[0-9a-fA-F]+$").unwrap());
    if hex.is_match(trimmed) {
        let negative = trimmed.starts_with('-');
        let digits = trimmed
            .trim_start_matches(['-', '+'])
            .trim_start_matches("0x");
        let number = digits.bytes().fold(0.0, |value, digit| {
            value * 16.0 + (digit as char).to_digit(16).unwrap() as f64
        });
        return Value::from(if negative { -number } else { number });
    }
    if let Some(captures) = exponent.captures(trimmed) {
        let sign = captures.get(1).map_or("", |value| value.as_str());
        let zeros = &captures[2];
        let remainder = &captures[3];
        let exponent_char = if remainder.contains('e') { 'e' } else { 'E' };
        let adjacent = input.chars().nth(zeros.len() + sign.len()) == Some(exponent_char);
        if zeros.len() > 1 && adjacent {
            return Value::String(input.into());
        }
        let number = if zeros.len() == 1
            && (remainder.starts_with(&format!(".{exponent_char}"))
                || remainder.starts_with(exponent_char))
        {
            trimmed.parse::<f64>()
        } else if !adjacent {
            format!("{sign}{remainder}").parse::<f64>()
        } else {
            return Value::String(input.into());
        };
        // strnum uses Number(); non-finite results serialize to JSON null.
        return Value::from(number.unwrap_or(f64::NAN));
    }

    if let Some(captures) = decimal.captures(trimmed) {
        if let Ok(number) = trimmed.parse::<f64>() {
            let parsed = ryu_js::Buffer::new().format(number).to_owned();
            if number == 0.0 || parsed.contains(['e', 'E']) {
                return Value::from(number);
            }
            let sign = captures.get(1).map_or("", |value| value.as_str());
            let mut remainder = captures[3].to_owned();
            if remainder.contains('.') {
                remainder = remainder
                    .trim_end_matches('0')
                    .trim_end_matches('.')
                    .to_owned();
                if remainder.is_empty() {
                    remainder = "0".into();
                } else if remainder.starts_with('.') {
                    remainder.insert(0, '0');
                }
            }
            let candidate = if !captures[2].is_empty() || trimmed.contains('.') {
                remainder.as_str()
            } else {
                trimmed
            };
            if parsed == candidate
                || parsed == format!("{sign}{candidate}")
                || candidate == format!("{sign}{parsed}")
            {
                return Value::from(number);
            }
        }
    }
    Value::String(input.into())
}

fn xml_error(error: impl std::fmt::Display) -> BackupError {
    BackupError::context("Cannot parse message XML", error)
}
