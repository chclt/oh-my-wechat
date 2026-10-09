import { FFmpeg } from "@ffmpeg/ffmpeg";
import coreURL from "@repo/ffmpeg-wasm/core?url";
import wasmURL from "@repo/ffmpeg-wasm/wasm?url";
import { AsyncQueuer } from "@tanstack/pacer";

async function loadFFmpeg() {
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
