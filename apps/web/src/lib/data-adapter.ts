import type { DataAdapter } from "@repo/types/adapter";
import {
	registerFileDownloads,
	type FileDownloads,
} from "./download-message-file";
import queryClient from "./query-client";

let dataAdapter: DataAdapter | undefined;
let closeDownloads: (() => void) | undefined;

const hasDataAdapter = () => dataAdapter !== undefined;

const getDataAdapter = () => {
	if (!dataAdapter) {
		throw new Error("Data adapter not set");
	}
	return dataAdapter;
};

// Serialize replacement/close so an old desktop adapter cannot unload a newer backup.
let transition: Promise<void> = Promise.resolve();

const setDataAdapter = (
	newAdapter: DataAdapter,
	createDownloads: () => FileDownloads,
) => {
	const next = transition.then(async () => {
		const previous = dataAdapter;
		if (previous === newAdapter) return;
		dataAdapter = undefined;
		closeDownloads?.();
		closeDownloads = undefined;
		await queryClient.cancelQueries();
		queryClient.removeQueries();
		await previous?._unloadDirectory();
		closeDownloads = registerFileDownloads(newAdapter, createDownloads());
		dataAdapter = newAdapter;
	});
	transition = next.catch(() => {});
	return next;
};

const clearDataAdapter = (expected?: DataAdapter) => {
	const next = transition.then(async () => {
		if (expected && dataAdapter !== expected) return;
		const previous = dataAdapter;
		dataAdapter = undefined;
		closeDownloads?.();
		closeDownloads = undefined;
		await queryClient.cancelQueries();
		queryClient.removeQueries();
		await previous?._unloadDirectory();
	});
	transition = next.catch(() => {});
	return next;
};

export { getDataAdapter, hasDataAdapter, setDataAdapter, clearDataAdapter };
