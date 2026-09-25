import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { AsyncQueuer } from "@tanstack/pacer";

async function loadFFmpeg() {
	const ffmpegCoreURL = import.meta.env.DEV
		? (await import("@ffmpeg/core?url")).default
		: "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js";

	const ffmpegWasmURL = import.meta.env.DEV
		? (await import("@ffmpeg/core/wasm?url")).default
		: "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm";

	const [coreURL, wasmURL] = await Promise.all([
		toBlobURL(ffmpegCoreURL, "text/javascript"),
		toBlobURL(ffmpegWasmURL, "application/wasm"),
	]);
	const ffmpeg = new FFmpeg();
	await ffmpeg.load({ coreURL, wasmURL });
	return ffmpeg;
}

let instance: Promise<FFmpeg> | undefined;

interface FFmpegQueueItem {
	run: (ffmpeg: FFmpeg) => Promise<void>;
	onError: (error: unknown) => void;
}

const queue = new AsyncQueuer<FFmpegQueueItem>(
	async (item) => {
		instance ??= loadFFmpeg().catch((error) => {
			instance = undefined;
			throw error;
		});
		await item.run(await instance);
	},
	{
		// addItemsTo: "back",
		// getItemsFrom: "back", // LIFO, some bug in tanstack pacer (^0.14.0), disable LIFO for now
		concurrency: 1,
		onError(error, item) {
			item.onError(error);
		},
	},
);

/** Serialize complete read/write/exec tasks on the shared FFmpeg instance. */
export function runFFmpeg<T>(task: (ffmpeg: FFmpeg) => Promise<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		queue.addItem({
			run: async (ffmpeg) => {
				resolve(await task(ffmpeg));
			},
			onError: reject,
		});
	});
}
