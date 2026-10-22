use webview2_com::{
    CoTaskMemPWSTR, ContextMenuRequestedEventHandler,
    Microsoft::Web::WebView2::Win32::{
        ICoreWebView2ContextMenuItemCollection, ICoreWebView2_11,
        COREWEBVIEW2_CONTEXT_MENU_ITEM_KIND_SEPARATOR, COREWEBVIEW2_CONTEXT_MENU_ITEM_KIND_SUBMENU,
    },
};
use windows_core::{Interface, Result, PWSTR};

// WebView2's unlocalized names; shortcut handling is unchanged.
const BLOCKED_ITEMS: &[&str] = &[
    "back",
    "forward",
    "saveAs",
    "print",
    "copyLinkToHighlight",
    "reload",
    "copyImageLocation",
    "magnifyImage",
    "openLinkInNewWindow",
    "saveLinkAs",
    "copyLinkLocation",
    "copyLink",
    // WebView2's actual Name uses this spelling.
    "pictureInPciture",
];

// These entries share Name "other"; match exact labels after removing '&' mnemonics.
const BLOCKED_OTHER_LABELS: &[&str] = &[
    "Import passwords",
    "Writing direction",
    // TODO: Verify these inferred Simplified Chinese labels in WebView2.
    "导入密码",
    "书写方向",
];

pub fn install(window: &tauri::WebviewWindow) -> tauri::Result<()> {
    window.with_webview(|webview| {
        if let Err(error) = register(&webview) {
            eprintln!("Cannot configure the WebView2 context menu: {error}");
        }
    })
}

fn register(webview: &tauri::webview::PlatformWebview) -> Result<()> {
    // SAFETY: with_webview and the WebView2 event callback run on the UI thread.
    unsafe {
        let core: ICoreWebView2_11 = webview.controller().CoreWebView2()?.cast()?;
        let handler = ContextMenuRequestedEventHandler::create(Box::new(|_, args| {
            if let Some(args) = args {
                let items = args.MenuItems()?;
                if let Err(error) = filter_items(&items) {
                    eprintln!("Cannot filter the WebView2 context menu: {error}");
                    return Err(error);
                }
            }
            // Keep Handled false so WebView2 renders and executes the remaining commands.
            Ok(())
        }));
        let mut token = 0;
        // WebView2 owns the handler until this window is destroyed. It captures no window.
        core.add_ContextMenuRequested(&handler, &mut token)?;
    }
    Ok(())
}

fn filter_items(items: &ICoreWebView2ContextMenuItemCollection) -> Result<u32> {
    // SAFETY: only called synchronously from ContextMenuRequested on the UI thread.
    unsafe {
        let mut count = 0;
        items.Count(&mut count)?;
        let mut next_is_separator = true;
        // Walk backwards so removing an item does not shift any unvisited index.
        for index in (0..count).rev() {
            let item = items.GetValueAtIndex(index)?;
            let mut kind = Default::default();
            item.Kind(&mut kind)?;

            let remove = if kind == COREWEBVIEW2_CONTEXT_MENU_ITEM_KIND_SEPARATOR {
                next_is_separator
            } else {
                let mut name = PWSTR::null();
                let result = item.Name(&mut name);
                let name = CoTaskMemPWSTR::from(name);
                result?;
                let name = name.to_string();
                let blocked_label = if name == "other" {
                    let mut label = PWSTR::null();
                    let result = item.Label(&mut label);
                    let label = CoTaskMemPWSTR::from(label);
                    result?;
                    // Ampersands mark keyboard mnemonics, not visible menu text.
                    BLOCKED_OTHER_LABELS.contains(&label.to_string().replace('&', "").as_str())
                } else {
                    false
                };
                BLOCKED_ITEMS.contains(&name.as_str())
                    || blocked_label
                    || (kind == COREWEBVIEW2_CONTEXT_MENU_ITEM_KIND_SUBMENU
                        && filter_items(&item.Children()?)? == 0)
            };

            if remove {
                items.RemoveValueAtIndex(index)?;
                count -= 1;
            } else {
                next_is_separator = kind == COREWEBVIEW2_CONTEXT_MENU_ITEM_KIND_SEPARATOR;
            }
        }
        if count > 0 && next_is_separator {
            items.RemoveValueAtIndex(0)?;
            count -= 1;
        }
        Ok(count)
    }
}
