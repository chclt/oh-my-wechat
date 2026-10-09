import { convertFileSrc } from "@tauri-apps/api/core";

// The caller owns the Blob URL and must revoke it when no longer needed.
export async function createFileUrl(
	path: string,
	type?: string,
	signal?: AbortSignal,
): Promise<string> {
	const response = await fetch(convertFileSrc(path), { signal });
	if (!response.ok) throw new Error(`Cannot read file: ${response.status}`);
	const blob = await response.blob();
	signal?.throwIfAborted();
	return URL.createObjectURL(type ? new Blob([blob], { type }) : blob);
}
