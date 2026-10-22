pub(super) fn split_group_content(content: &str) -> (String, String) {
    if let Some(position) = content.find(":\n") {
        (
            content[..position].to_owned(),
            content[position + 2..].to_owned(),
        )
    } else {
        // Preserve splitGroupMessageContent's slice(0, -1) / slice(1) behavior.
        let units = content.encode_utf16().collect::<Vec<_>>();
        let sender = String::from_utf16_lossy(&units[..units.len().saturating_sub(1)]);
        let content = String::from_utf16_lossy(&units[units.len().min(1)..]);
        (sender, content)
    }
}
