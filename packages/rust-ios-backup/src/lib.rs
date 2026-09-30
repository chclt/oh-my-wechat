mod account;
mod backup;
mod chat;
mod commands;
mod contact;
mod database;
mod encryption;
mod errors;
mod manifest;
mod message;
mod state;
mod utils;

pub use state::BackupState;

use tauri::{ipc::Invoke, Runtime};

/// The desktop entry point only registers this handler and starts the application.
pub fn invoke_handler<R: Runtime>() -> impl Fn(Invoke<R>) -> bool + Send + Sync + 'static {
    tauri::generate_handler![
        commands::show_directory_picker,
        commands::load_backup_directory,
        commands::get_account_list,
        commands::get_account,
        commands::get_account_contact_list,
        commands::get_chat_list,
        commands::get_user_list,
        commands::search_chats,
        commands::get_message_list,
        commands::load_account_database,
        commands::unload_account_database
    ]
}
