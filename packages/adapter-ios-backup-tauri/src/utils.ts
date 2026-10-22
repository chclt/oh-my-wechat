import { invoke } from "./invoke";

/** Cancellation returns null; selecting a directory does not load it. */
export function showDirectoryPicker(): Promise<string | null> {
	return invoke("show_directory_picker");
}
