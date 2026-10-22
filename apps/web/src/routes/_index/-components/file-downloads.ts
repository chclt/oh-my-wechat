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
