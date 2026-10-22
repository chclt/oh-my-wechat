import type { ResolveMessageFileRequest } from "@repo/types/adapter";
import { convertFileSrc } from "@tauri-apps/api/core";
import { createFileUrl } from "./file";
import { invoke } from "./invoke";

interface MediaFile {
	key: string;
	referenceId: string;
	references: Set<string>;
	controller: AbortController;
	src: Promise<string>;
}

/** Shared resource URLs; raw files become Blobs so Rust can release temporary files early. */
export class MediaFiles {
	private readonly files = new Map<string, MediaFile>();
	private readonly references = new Map<string, MediaFile>();

	resolve({
		uri,
		referenceId,
		raw = false,
	}: ResolveMessageFileRequest): Promise<string> {
		const key = JSON.stringify([uri, raw]);
		let file = this.files.get(key);
		if (!file) {
			const backendReferenceId = crypto.randomUUID();
			const controller = new AbortController();
			const src = invoke("resolve_message_file", {
				request: { uri, referenceId: backendReferenceId, raw },
			}).then(async ({ data }) => {
				try {
					controller.signal.throwIfAborted();
					const needsBlob =
						raw ||
						(import.meta.env.TAURI_ENV_PLATFORM === "linux" &&
							(data.mimeType.startsWith("audio/") ||
								data.mimeType.startsWith("video/")));
					return needsBlob
						? await createFileUrl(data.src, data.mimeType, controller.signal)
						: convertFileSrc(data.src, "backup-file");
				} finally {
					// A fully read Blob no longer depends on the source file. Failure also releases it.
					if (raw)
						await invoke("release_message_file", {
							request: { referenceId: backendReferenceId },
						}).catch(() => {});
				}
			});
			file = {
				key,
				referenceId: backendReferenceId,
				references: new Set(),
				controller,
				src,
			};
			this.files.set(key, file);
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
		this.files.delete(file.key);
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
