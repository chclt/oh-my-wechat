fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_opener::Builder::new()
                .open_js_links_on_click(false)
                .build(),
        )
        .manage(rust_ios_backup::BackupState::default())
        .invoke_handler(rust_ios_backup::invoke_handler())
        .build(tauri::generate_context!())
        .expect("failed to build Oh My WeChat")
        .run(rust_ios_backup::on_event);
}
