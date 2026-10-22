import { listen } from "@tauri-apps/api/event";
import { invoke } from "./invoke";

/** Cancellation returns null; selecting a directory does not load it. */
export function showDirectoryPicker(): Promise<string | null> {
	return invoke("show_directory_picker");
}

/** Fired for both successful and failed WebView downloads. */
export function onFileDownloadFinished(callback: (url: string) => void) {
	return listen<string>("message-file-download-finished", ({ payload }) =>
		callback(payload),
	);
}
