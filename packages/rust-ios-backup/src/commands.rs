use crate::{account::AccountList, BackupState};
use crate::{backup::LoadedBackup, errors::BackupError};
use std::path::PathBuf;
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
pub(crate) async fn show_directory_picker<R: tauri::Runtime>(
    window: tauri::WebviewWindow<R>,
) -> Result<Option<String>, BackupError> {
    // The picker only returns a path; loading is a separate command.
    tauri::async_runtime::spawn_blocking(move || {
        let Some(selected) = window
            .dialog()
            .file()
            .set_parent(&window)
            .set_title("选择目录")
            .set_can_create_directories(false)
            .blocking_pick_folder()
        else {
            return Ok(None);
        };
        let path = selected
            .into_path()
            .map_err(|error| BackupError::context("无法获取本地目录路径", error))?;
        let path = path
            .into_os_string()
            .into_string()
            .map_err(|_| BackupError::new("Error", "目录路径无法转换为 UTF-8"))?;
        Ok(Some(path))
    })
    .await
    .map_err(|error| BackupError::context("打开目录选择器失败", error))?
}

#[tauri::command]
pub(crate) async fn load_backup_directory(
    state: tauri::State<'_, BackupState>,
    directory: PathBuf,
    password: Option<String>,
) -> Result<(), BackupError> {
    let generation = state.begin_directory_load()?;
    let state = state.inner().clone();
    tauri::async_runtime::spawn_blocking(move || {
        let backup = LoadedBackup::open(directory, password, || state.check_current(generation))?;
        state.finish_directory_load(generation, backup)
    })
    .await
    .map_err(|error| BackupError::context("加载备份目录失败", error))?
}

#[tauri::command]
pub(crate) async fn get_account_list(
    state: tauri::State<'_, BackupState>,
) -> Result<AccountList, BackupError> {
    state.account_list()
}

#[derive(serde::Serialize)]
pub(crate) struct AccountResponse {
    data: crate::account::Account,
}

#[tauri::command]
pub(crate) async fn get_account(
    state: tauri::State<'_, BackupState>,
    account_id: String,
) -> Result<AccountResponse, BackupError> {
    Ok(AccountResponse {
        data: state.account(&account_id)?,
    })
}

#[tauri::command]
pub(crate) async fn load_account_database(
    state: tauri::State<'_, BackupState>,
    account_id: String,
) -> Result<(), BackupError> {
    let (backup, generation) = state.begin_account_load()?;
    let state = state.inner().clone();
    tauri::async_runtime::spawn_blocking(move || {
        let databases =
            crate::account::database::load_account_databases(&backup, &account_id, || {
                state.check_current(generation)
            })?;
        state.finish_account_load(generation, databases)
    })
    .await
    .map_err(|error| BackupError::context("加载账号数据库失败", error))?
}

#[tauri::command]
pub(crate) fn unload_account_database(
    state: tauri::State<'_, BackupState>,
) -> Result<(), BackupError> {
    state.unload_account()
}
