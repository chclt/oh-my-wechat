#[derive(Clone, Debug, serde::Serialize)]
pub(crate) struct BackupError {
    name: &'static str,
    message: String,
}

impl BackupError {
    pub(crate) fn new(name: &'static str, message: impl Into<String>) -> Self {
        Self {
            name,
            message: message.into(),
        }
    }

    pub(crate) fn context(context: impl std::fmt::Display, source: impl std::fmt::Display) -> Self {
        Self::new("Error", format!("{context}: {source}"))
    }

    pub(crate) fn invalid(message: impl Into<String>) -> Self {
        Self::new("InvalidBackupError", message)
    }
}
