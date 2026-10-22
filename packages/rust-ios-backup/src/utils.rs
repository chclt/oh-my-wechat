// ECMAScript trim/\s includes BOM and excludes U+0085, unlike Rust whitespace.
pub(crate) fn is_js_whitespace(character: char) -> bool {
    matches!(character,
        '\u{0009}'..='\u{000d}' | ' ' | '\u{00a0}' | '\u{1680}' |
        '\u{2000}'..='\u{200a}' | '\u{2028}' | '\u{2029}' | '\u{202f}' |
        '\u{205f}' | '\u{3000}' | '\u{feff}'
    )
}
