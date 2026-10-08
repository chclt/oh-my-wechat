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

/// The desktop entry point only registers this handler and starts the application.
pub fn invoke_handler<R: Runtime>() -> impl Fn(Invoke<R>) -> bool + Send + Sync + 'static {
    let handler: fn(Invoke<R>) -> bool = tauri::generate_handler![
        commands::show_directory_picker,
        commands::load_backup_directory,
        commands::get_account_list,
        commands::get_account,
        commands::get_account_contact_list,
        commands::get_chat_list,
        commands::get_user_list,
        commands::search_chats,
        commands::get_message_list,
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
        commands::load_account_database,
        commands::unload_account_database
    ];
    move |invoke: Invoke<R>| {
        if invoke.message.command() == "resolve_message_file" {
            commands::resolve_message_file(invoke);
            true
        } else {
            handler(invoke)
        }
    }
}

/// Tauri exits the process without running destructors; dispose media explicitly.
pub fn on_event<R: Runtime>(app: &tauri::AppHandle<R>, event: tauri::RunEvent) {
    use tauri::Manager;
    if matches!(event, tauri::RunEvent::Exit) {
        let files = app.state::<BackupState>().file_registry();
        if let Ok(files) = &files {
            files.close();
        }
        // Old-session jobs may still be running while a new backup is loading.
        crate::file::finish_pending();
        if let Ok(files) = files {
            files.clear();
        }
    }
}
