import type { ResolveMessageFileRequest } from "@repo/types/adapter";
import { convertFileSrc } from "@tauri-apps/api/core";
import { createFileUrl } from "./file";
import { invoke } from "./invoke";

interface MediaFile {
	uri: string;
	referenceId: string;
	references: Set<string>;
	controller: AbortController;
	src: Promise<string>;
}

/** WebKitGTK media URLs, with one Rust reference per shared resource. */
export class MediaFiles {
	private readonly files = new Map<string, MediaFile>();
	private readonly references = new Map<string, MediaFile>();

	resolve({ uri, referenceId }: ResolveMessageFileRequest): Promise<string> {
		let file = this.files.get(uri);
		if (!file) {
			const backendReferenceId = crypto.randomUUID();
			const controller = new AbortController();
			const src = invoke("resolve_message_file", {
				request: { uri, referenceId: backendReferenceId },
			}).then(({ data }) => {
				controller.signal.throwIfAborted();
				return data.mimeType.startsWith("audio/") ||
					data.mimeType.startsWith("video/")
					? createFileUrl(data.src, data.mimeType, controller.signal)
					: convertFileSrc(data.src);
			});
			file = {
				uri,
				referenceId: backendReferenceId,
				references: new Set(),
				controller,
				src,
			};
			this.files.set(uri, file);
		}
		file.references.add(referenceId);
		this.references.set(referenceId, file);
		return file.src.catch(async (error) => {
			await this.release(referenceId);
			throw error;
		});
	}

	async release(referenceId: string): Promise<void> {
		const file = this.references.get(referenceId);
		if (!file) return;
		this.references.delete(referenceId);
		file.references.delete(referenceId);
		if (file.references.size > 0) return;
		this.files.delete(file.uri);
		file.controller.abort();
		// A late completion still owns a URL. Reclaim it without delaying release
		// of queued Rust work; a failed load never created a URL to reclaim.
		void file.src.then(
			(src) => {
				if (src.startsWith("blob:")) URL.revokeObjectURL(src);
			},
			() => {},
		);
		await invoke("release_message_file", {
			request: { referenceId: file.referenceId },
		});
	}

	async clear(): Promise<void> {
		await Promise.all(
			Array.from(this.references.keys(), (referenceId) =>
				this.release(referenceId),
			),
		);
	}
}
