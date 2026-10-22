mod account;
mod backup;
mod chat;
mod commands;
mod contact;
mod database;
mod encryption;
mod errors;
mod file;
mod manifest;
mod media;
mod message;
mod state;
mod utils;

pub use state::BackupState;

use tauri::{ipc::Invoke, Runtime};

/// Serve only currently acquired files, without granting filesystem directory access.
pub fn configure<R: Runtime>(builder: tauri::Builder<R>) -> tauri::Builder<R> {
    builder.register_asynchronous_uri_scheme_protocol("backup-file", file::protocol::handle)
}

/// Use the host's prepared instance directory; the host owns its lifetime and cleanup.
pub fn initialize<R: Runtime>(app: &tauri::AppHandle<R>, directory: std::path::PathBuf) {
    file::initialize(app, directory)
}

/// Invalidate the current backup session and release its resources.
pub fn close_backup<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<(), String> {
    use tauri::Manager;
    app.state::<BackupState>()
        .unload_directory()
        .map(|_| ())
        .map_err(|error| error.to_string())
}

/// Expose backup commands for registration by the desktop entry point.
pub fn invoke_handler<R: Runtime>() -> impl Fn(Invoke<R>) -> bool + Send + Sync + 'static {
    let handler: fn(Invoke<R>) -> bool = tauri::generate_handler![
        commands::show_directory_picker,
        commands::unload_backup_directory,
        commands::get_account_list,
        commands::get_account,
        commands::get_account_contact_list,
        commands::get_chat_list,
        commands::get_user_list,
        commands::search_chats,
        commands::get_message_list,
        commands::search_messages,
        commands::get_message_search_index_status,
        commands::get_greeting_message_list,
        commands::get_message_image,
        commands::get_message_video,
        commands::get_message_voice,
        commands::get_message_attach,
        commands::get_record_image,
        commands::get_record_video,
        commands::get_record_audio,
        commands::get_record_file,
        commands::release_message_file,
        commands::unload_account_database
    ];
    move |invoke: Invoke<R>| {
        match invoke.message.command() {
            "resolve_message_file" => commands::resolve_message_file(invoke),
            "load_backup_directory" => commands::load_backup_directory(invoke),
            "load_account_database" => commands::load_account_database(invoke),
            _ => return handler(invoke),
        }
        true
    }
}

/// Finish backup cleanup before the host exits without running destructors.
pub fn shutdown<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<(), String> {
    let result = close_backup(app);
    // Old-session jobs may still be running while a new backup is loading.
    crate::file::finish_pending();
    result
}
