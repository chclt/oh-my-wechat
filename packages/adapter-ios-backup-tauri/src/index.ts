import { invoke } from "@tauri-apps/api/core";

export interface DesktopInfo {
	version: string;
	platform: string;
}

export function getDesktopInfo(): Promise<DesktopInfo> {
	return invoke<DesktopInfo>("get_desktop_info");
}
