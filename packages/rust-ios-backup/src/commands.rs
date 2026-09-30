#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DesktopInfo {
    version: String,
    platform: &'static str,
}

#[tauri::command]
pub(crate) fn get_desktop_info<R: tauri::Runtime>(app: tauri::AppHandle<R>) -> DesktopInfo {
    #[cfg(debug_assertions)]
    eprintln!("[rust-ios-backup] Received frontend invoke: get_desktop_info");

    DesktopInfo {
        version: app.package_info().version.to_string(),
        platform: std::env::consts::OS,
    }
}
