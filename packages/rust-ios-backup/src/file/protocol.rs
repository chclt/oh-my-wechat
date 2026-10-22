use crate::BackupState;
use std::{
    fs::File,
    io::{Read, Seek, SeekFrom},
    sync::Arc,
};
use tauri::{
    http::{header::*, Method, Request, Response, StatusCode},
    Manager, Runtime, UriSchemeContext, UriSchemeResponder,
};

pub(crate) fn handle<R: Runtime>(
    context: UriSchemeContext<'_, R>,
    request: Request<Vec<u8>>,
    responder: UriSchemeResponder,
) {
    let app = context.app_handle().clone();
    // Match the requesting WebView's origin, including the development server.
    let origin = app
        .get_webview_window(context.webview_label())
        .and_then(|webview| webview.url().ok())
        .map(|url| {
            format!(
                "{}://{}{}",
                url.scheme(),
                url.host_str().unwrap_or("localhost"),
                url.port()
                    .map(|port| format!(":{port}"))
                    .unwrap_or_default()
            )
        })
        .unwrap_or_else(|| "null".to_owned());
    tauri::async_runtime::spawn_blocking(move || {
        let response = serve(&app, &request)
            .unwrap_or_else(|status| Response::builder().status(status).body(Vec::new()).unwrap());
        let (mut parts, body) = response.into_parts();
        if let Ok(origin) = origin.parse() {
            parts.headers.insert(ACCESS_CONTROL_ALLOW_ORIGIN, origin);
        }
        parts
            .headers
            .insert(CACHE_CONTROL, "no-store".parse().unwrap());
        parts
            .headers
            .insert(X_CONTENT_TYPE_OPTIONS, "nosniff".parse().unwrap());
        parts.headers.insert(
            ACCESS_CONTROL_ALLOW_METHODS,
            "GET, HEAD, OPTIONS".parse().unwrap(),
        );
        parts
            .headers
            .insert(ACCESS_CONTROL_ALLOW_HEADERS, "Range".parse().unwrap());
        parts.headers.insert(
            ACCESS_CONTROL_EXPOSE_HEADERS,
            "Content-Range, Accept-Ranges, Content-Length"
                .parse()
                .unwrap(),
        );
        responder.respond(Response::from_parts(parts, body));
    });
}

fn serve<R: Runtime>(
    app: &tauri::AppHandle<R>,
    request: &Request<Vec<u8>>,
) -> Result<Response<Vec<u8>>, StatusCode> {
    if request.method() == Method::OPTIONS {
        return Ok(Response::builder().status(204).body(Vec::new()).unwrap());
    }
    if request.method() != Method::GET && request.method() != Method::HEAD {
        return Err(StatusCode::METHOD_NOT_ALLOWED);
    }
    // The URL contains only a hex-encoded acquisition ID, never a disk path.
    let token = request
        .uri()
        .path()
        .strip_prefix('/')
        .ok_or(StatusCode::NOT_FOUND)?;
    if token.is_empty()
        || token.len() % 2 != 0
        || !token.bytes().all(|byte| byte.is_ascii_hexdigit())
    {
        return Err(StatusCode::NOT_FOUND);
    }
    let bytes = (0..token.len())
        .step_by(2)
        .map(|index| u8::from_str_radix(&token[index..index + 2], 16).unwrap())
        .collect();
    let reference = String::from_utf8(bytes).map_err(|_| StatusCode::NOT_FOUND)?;
    let registry = app
        .state::<BackupState>()
        .file_registry()
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let resolved = registry.resolved(&reference).ok_or(StatusCode::NOT_FOUND)?;
    // Holding the file owner keeps generated files alive for this read.
    let mut file = File::open(&resolved.path).map_err(|_| StatusCode::NOT_FOUND)?;
    let length = file
        .metadata()
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .len();
    let source = resolved
        .source(&reference)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let mut response = Response::builder()
        .header(CONTENT_TYPE, source.mime_type)
        .header(ACCEPT_RANGES, "bytes");
    let range = if request.method() == Method::GET {
        request.headers().get(RANGE)
    } else {
        None
    };
    let (start, count) = if let Some(range) = range {
        let Some((start, end)) = range
            .to_str()
            .ok()
            .and_then(|range| parse_range(range, length))
        else {
            return Ok(response
                .status(416)
                .header(CONTENT_RANGE, format!("bytes */{length}"))
                .body(Vec::new())
                .unwrap());
        };
        // Like Tauri's asset protocol, serve bounded chunks for media seeking.
        let end = end.min(start.saturating_add(1024 * 1024 - 1));
        response = response
            .status(206)
            .header(CONTENT_RANGE, format!("bytes {start}-{end}/{length}"));
        (start, end - start + 1)
    } else {
        (0, length)
    };
    let mut body = Vec::new();
    if request.method() != Method::HEAD {
        file.seek(SeekFrom::Start(start))
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        file.take(count)
            .read_to_end(&mut body)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        if body.len() as u64 != count {
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    }
    // Closing/releasing during I/O must not publish the old file afterwards.
    if !registry
        .resolved(&reference)
        .is_some_and(|current| Arc::ptr_eq(&current, &resolved))
    {
        return Err(StatusCode::NOT_FOUND);
    }
    Ok(response.header(CONTENT_LENGTH, count).body(body).unwrap())
}

fn parse_range(value: &str, length: u64) -> Option<(u64, u64)> {
    if length == 0 {
        return None;
    }
    let (start, end) = value.strip_prefix("bytes=")?.trim().split_once('-')?;
    if start.is_empty() {
        let suffix: u64 = end.parse().ok()?;
        return (suffix > 0).then(|| (length.saturating_sub(suffix), length - 1));
    }
    let start: u64 = start.parse().ok()?;
    let end = if end.is_empty() {
        length - 1
    } else {
        end.parse::<u64>().ok()?.min(length - 1)
    };
    (start < length && start <= end).then_some((start, end))
}
