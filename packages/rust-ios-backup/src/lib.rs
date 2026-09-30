mod commands;

use tauri::{ipc::Invoke, Runtime};

pub fn invoke_handler<R: Runtime>() -> impl Fn(Invoke<R>) -> bool + Send + Sync + 'static {
    tauri::generate_handler![commands::get_desktop_info]
}
