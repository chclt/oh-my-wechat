import { onFileDownloadFinished } from "@repo/adapter-ios-backup-tauri/utils";
import type { FileDownloads } from "@/lib/download-message-file";

export function createBrowserDownloads(): FileDownloads {
	let closed = false;
	const pending = new Map<() => void, ReturnType<typeof setTimeout>>();
	return {
		async track(_src, release) {
			if (closed) throw new DOMException("Backup was closed", "AbortError");
			pending.set(release, setTimeout(release, 60_000));
			return () => {
				clearTimeout(pending.get(release));
				pending.delete(release);
			};
		},
		close() {
			closed = true;
			for (const [release, timer] of pending) {
				clearTimeout(timer);
				release();
			}
			pending.clear();
		},
	};
}

export function createDesktopDownloads(): FileDownloads {
	let closed = false;
	const pending = new Map<string, Set<() => void>>();
	let listener: Promise<() => void> | undefined;
	return {
		async track(src, release) {
			if (closed) throw new DOMException("Backup was closed", "AbortError");
			listener ??= onFileDownloadFinished((url) => {
				// Several downloads may share a URL; each completion releases one reference.
				pending.get(url)?.values().next().value?.();
			}).catch((error) => {
				listener = undefined;
				throw error;
			});
			await listener;
			if (closed) throw new DOMException("Backup was closed", "AbortError");
			const references = pending.get(src) ?? new Set<() => void>();
			references.add(release);
			pending.set(src, references);
			return () => {
				references.delete(release);
				if (references.size === 0) pending.delete(src);
			};
		},
		close() {
			closed = true;
			for (const references of pending.values())
				for (const release of references) release();
			pending.clear();
			void listener?.then(
				(unlisten) => unlisten(),
				() => {},
			);
		},
	};
}
