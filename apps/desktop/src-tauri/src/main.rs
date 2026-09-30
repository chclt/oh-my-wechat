#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(rust_ios_backup::BackupState::default())
        .invoke_handler(rust_ios_backup::invoke_handler())
        .run(tauri::generate_context!())
        .expect("failed to run Oh My WeChat");
}
