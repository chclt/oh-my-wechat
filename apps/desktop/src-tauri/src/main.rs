#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .invoke_handler(rust_ios_backup::invoke_handler())
        .run(tauri::generate_context!())
        .expect("failed to run Oh My WeChat");
}
