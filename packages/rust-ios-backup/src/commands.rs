use crate::{account::AccountList, BackupState};
use crate::{backup::LoadedBackup, errors::BackupError, file::FileSource};
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
pub(crate) async fn load_backup_directory<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
    state: tauri::State<'_, BackupState>,
    directory: PathBuf,
    password: Option<String>,
) -> Result<(), BackupError> {
    use tauri::Manager;
    let generation = state.begin_directory_load()?;
    let state = state.inner().clone();
    tauri::async_runtime::spawn_blocking(move || {
        let backup = LoadedBackup::open(directory, password, || state.check_current(generation))?;
        app.asset_protocol_scope()
            .allow_directory(&backup.directory, true)
            .map_err(|error| BackupError::context("Cannot expose backup files", error))?;
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
pub(crate) async fn get_account_contact_list(
    state: tauri::State<'_, BackupState>,
    account_id: String,
) -> Result<crate::contact::ContactList, BackupError> {
    let state = state.inner().clone();
    tauri::async_runtime::spawn_blocking(move || {
        state.with_account(&account_id, |databases| {
            crate::contact::list(&databases.contact)
        })
    })
    .await
    .map_err(|error| BackupError::context("读取通讯录列表失败", error))?
}

#[derive(serde::Serialize)]
pub(crate) struct UserListResponse {
    data: Vec<crate::contact::Contact>,
}

#[tauri::command]
pub(crate) async fn get_user_list(
    state: tauri::State<'_, BackupState>,
    account_id: String,
    user_ids: Vec<String>,
) -> Result<UserListResponse, BackupError> {
    let state = state.inner().clone();
    tauri::async_runtime::spawn_blocking(move || {
        state.with_account(&account_id, |databases| {
            Ok(UserListResponse {
                data: crate::contact::find(&databases.contact, &databases.account, &user_ids)?,
            })
        })
    })
    .await
    .map_err(|error| BackupError::context("读取用户列表失败", error))?
}

#[tauri::command]
pub(crate) async fn get_chat_list(
    state: tauri::State<'_, BackupState>,
    account_id: String,
    user_ids: Option<Vec<String>>,
) -> Result<crate::chat::ChatList, BackupError> {
    let state = state.inner().clone();
    tauri::async_runtime::spawn_blocking(move || {
        state.with_account(&account_id, |databases| {
            crate::chat::list(databases, user_ids.as_deref())
        })
    })
    .await
    .map_err(|error| BackupError::context("读取聊天列表失败", error))?
}

#[tauri::command]
pub(crate) async fn search_chats(
    state: tauri::State<'_, BackupState>,
    account_id: String,
    query: String,
    offset: usize,
    limit: usize,
    language: icu_locale_core::LanguageIdentifier,
) -> Result<crate::chat::ChatSearchResult, BackupError> {
    let state = state.inner().clone();
    tauri::async_runtime::spawn_blocking(move || {
        state.with_account(&account_id, |databases| {
            crate::chat::search(databases, &query, offset, limit, &language)
        })
    })
    .await
    .map_err(|error| BackupError::context("搜索聊天失败", error))?
}

#[tauri::command]
pub(crate) async fn get_message_list(
    state: tauri::State<'_, BackupState>,
    request: crate::message::MessageListRequest,
) -> Result<crate::message::MessageList, BackupError> {
    let state = state.inner().clone();
    tauri::async_runtime::spawn_blocking(move || {
        state.with_account(&request.account.id, |databases| {
            crate::message::list(databases, &request)
        })
    })
    .await
    .map_err(|error| BackupError::context("读取消息列表失败", error))?
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

#[tauri::command]
pub(crate) async fn get_message_image(
    state: tauri::State<'_, BackupState>,
    request: crate::media::ImageRequest,
) -> Result<crate::media::Response<crate::media::ImageInfo>, BackupError> {
    let (backup, _) = state.files()?;
    tauri::async_runtime::spawn_blocking(move || crate::media::image(&backup, request))
        .await
        .map_err(|error| BackupError::context("读取图片信息失败", error))?
}

#[tauri::command]
pub(crate) async fn get_message_video(
    state: tauri::State<'_, BackupState>,
    request: crate::media::VideoRequest,
) -> Result<crate::media::Response<Option<crate::media::VideoInfo>>, BackupError> {
    let (backup, _) = state.files()?;
    tauri::async_runtime::spawn_blocking(move || crate::media::video(&backup, request))
        .await
        .map_err(|error| BackupError::context("读取视频信息失败", error))?
}

#[tauri::command]
pub(crate) async fn get_message_voice(
    state: tauri::State<'_, BackupState>,
    request: crate::media::VoiceRequest,
) -> Result<crate::media::Response<Option<crate::media::VoiceInfo>>, BackupError> {
    let (backup, _) = state.files()?;
    tauri::async_runtime::spawn_blocking(move || crate::media::voice(&backup, request))
        .await
        .map_err(|error| BackupError::context("读取语音信息失败", error))?
}

// This command registers the reference before handing work to Tauri's runtime.
// An async #[tauri::command] would also defer registration past a later release.
pub(crate) fn resolve_message_file<R: tauri::Runtime>(invoke: tauri::ipc::Invoke<R>) {
    use tauri::{
        ipc::{CommandArg, CommandItem, Invoke, InvokeError},
        Manager,
    };
    let Invoke {
        message,
        resolver,
        acl,
    } = invoke;
    let pending = (|| {
        let request = crate::file::ResolveRequest::from_command(CommandItem {
            plugin: None,
            name: "resolve_message_file",
            key: "request",
            message: &message,
            acl: &acl,
        })?;
        let app = message.webview_ref().app_handle();
        let (backup, registry) = app.state::<BackupState>().files()?;
        crate::file::resolve(backup, registry, request.uri, request.reference_id)
            .map_err(InvokeError::from)
    })();
    match pending {
        Ok(pending) => resolver.respond_async(async move {
            let file = pending.await?;
            Ok::<_, InvokeError>(crate::media::Response {
                data: FileSource {
                    src: file.path.clone(),
                },
            })
        }),
        Err(error) => resolver.invoke_error(error),
    }
}

#[tauri::command]
pub(crate) fn release_message_file(
    state: tauri::State<'_, BackupState>,
    request: crate::file::ReleaseRequest,
) -> Result<(), BackupError> {
    state.release_file(&request.reference_id)
}

#[tauri::command]
pub(crate) async fn get_message_attach(
    state: tauri::State<'_, BackupState>,
    request: crate::media::AttachRequest,
) -> Result<crate::media::Response<Option<FileSource>>, BackupError> {
    let (backup, registry) = state.files()?;
    crate::media::attach(backup, registry, request).await
}

#[tauri::command]
pub(crate) async fn get_record_image(
    state: tauri::State<'_, BackupState>,
    request: crate::media::record::RecordRequest,
) -> Result<crate::media::Response<crate::media::ImageInfo>, BackupError> {
    let (backup, _) = state.files()?;
    tauri::async_runtime::spawn_blocking(move || crate::media::record::image(&backup, request))
        .await
        .map_err(|error| BackupError::context("读取记录图片失败", error))?
}

#[tauri::command]
pub(crate) async fn get_record_video(
    state: tauri::State<'_, BackupState>,
    request: crate::media::record::RecordRequest,
) -> Result<crate::media::Response<crate::media::VideoInfo>, BackupError> {
    let (backup, _) = state.files()?;
    tauri::async_runtime::spawn_blocking(move || crate::media::record::video(&backup, request))
        .await
        .map_err(|error| BackupError::context("读取记录视频失败", error))?
}

#[tauri::command]
pub(crate) async fn get_record_audio(
    state: tauri::State<'_, BackupState>,
    request: crate::media::record::RecordFileRequest,
) -> Result<crate::media::Response<Option<crate::media::VoiceInfo>>, BackupError> {
    let (backup, _) = state.files()?;
    tauri::async_runtime::spawn_blocking(move || crate::media::record::audio(&backup, request))
        .await
        .map_err(|error| BackupError::context("读取记录音频失败", error))?
}

#[tauri::command]
pub(crate) async fn get_record_file(
    state: tauri::State<'_, BackupState>,
    request: crate::media::record::RecordFileRequest,
) -> Result<crate::media::Response<Option<FileSource>>, BackupError> {
    let (backup, registry) = state.files()?;
    crate::media::record::file(backup, registry, request).await
}
