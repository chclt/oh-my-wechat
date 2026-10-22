import type { DataAdapter } from "@repo/types/adapter";

/** Supplied by the application entry together with the adapter. */
export interface FileDownloads {
	track(src: string, release: () => void): Promise<() => void>;
	close(): void;
}

const downloads = new WeakMap<DataAdapter, FileDownloads>();

export function registerFileDownloads(
	adapter: DataAdapter,
	implementation: FileDownloads,
) {
	downloads.set(adapter, implementation);
	return () => {
		downloads.delete(adapter);
		implementation.close();
	};
}

/** Download references belong to the download, not the mounted message component. */
export async function downloadMessageFile(
	adapter: DataAdapter,
	uri: string,
	name: string,
) {
	const implementation = downloads.get(adapter);
	if (!implementation) throw new Error("File downloads are not available");
	const referenceId = crypto.randomUUID();
	let released = false;
	let stopTracking: (() => void) | undefined;
	const release = () => {
		if (released) return;
		released = true;
		stopTracking?.();
		void adapter.releaseMessageFile({ referenceId }).catch(() => {});
	};
	try {
		const {
			data: { src },
		} = await adapter.resolveMessageFile({ uri, referenceId, raw: true });
		stopTracking = await implementation.track(src, release);
		// Closing while registration was awaiting its listener must not start a download.
		if (released || downloads.get(adapter) !== implementation) {
			stopTracking();
			throw new DOMException("Backup was closed", "AbortError");
		}
		const link = document.createElement("a");
		link.href = src;
		link.download = name;
		document.body.append(link);
		try {
			link.click();
		} finally {
			link.remove();
		}
	} catch (error) {
		release();
		throw error;
	}
}
