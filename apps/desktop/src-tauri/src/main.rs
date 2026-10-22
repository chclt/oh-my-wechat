#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(windows)]
mod context_menu;
mod temp;

use std::{fs, sync::Mutex};
use tauri::{Emitter, Manager};

fn main() {
    rust_ios_backup::configure(tauri::Builder::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_opener::Builder::new()
                .open_js_links_on_click(false)
                .build(),
        )
        .setup(|app| {
            let cache = app.path().app_cache_dir()?;
            fs::create_dir_all(&cache)?;
            let instance = temp::Instance::new(cache.join("temp"))?;
            rust_ios_backup::initialize(app.handle(), instance.path().to_owned());
            app.manage(Mutex::new(Some(instance)));
            let config = app
                .config()
                .app
                .windows
                .iter()
                .find(|window| window.label == "main")
                .ok_or_else(|| std::io::Error::other("Main window configuration is missing"))?;
            let _window = tauri::WebviewWindowBuilder::from_config(app, config)?
                .on_download(|webview, event| {
                    if let tauri::webview::DownloadEvent::Finished { url, .. } = event {
                        let _ = webview.emit("message-file-download-finished", url.as_str());
                    }
                    true
                })
                .on_page_load(|webview, payload| {
                    // A full document reload loses frontend state; SPA navigation does not.
                    if matches!(payload.event(), tauri::webview::PageLoadEvent::Started) {
                        if let Err(error) = rust_ios_backup::close_backup(webview.app_handle()) {
                            eprintln!("Cannot close backup on page load: {error}");
                        }
                    }
                })
                .build()?;
            #[cfg(windows)]
            context_menu::install(&_window)?;
            Ok(())
        })
        .manage(rust_ios_backup::BackupState::default())
        .invoke_handler(rust_ios_backup::invoke_handler())
        .build(tauri::generate_context!())
        .expect("failed to build Oh My WeChat")
        .run(|app, event| {
            if matches!(event, tauri::RunEvent::Exit) {
                if let Err(error) = rust_ios_backup::shutdown(app) {
                    eprintln!("Cannot close backup: {error}");
                }
                // The backend finishes its work before the shell removes the instance.
                app.state::<Mutex<Option<temp::Instance>>>()
                    .lock()
                    .unwrap()
                    .take();
            }
        });
}
