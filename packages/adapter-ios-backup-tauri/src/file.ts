import { convertFileSrc } from "@tauri-apps/api/core";

// Download components own the Blob URL, preserving the existing <a download> flow.
export async function createFileUrl(
	path: string,
	type?: string,
): Promise<string> {
	const response = await fetch(convertFileSrc(path));
	if (!response.ok)
		throw new Error(`Cannot read attachment: ${response.status}`);
	const blob = await response.blob();
	return URL.createObjectURL(type ? new Blob([blob], { type }) : blob);
}
