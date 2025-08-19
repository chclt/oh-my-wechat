import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { AsyncQueuer } from "@tanstack/pacer";
import { decode } from "silk-wasm";
// import ffmpegCoreURL from "@ffmpeg/core?url";
// import ffmpegWasmURL from "@ffmpeg/core/wasm?url";

const ffmpegCoreURL =
	"https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js";
const ffmpegWasmURL =
	"https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm";

const ffmpeg = new FFmpeg();

async function initFFmpeg() {
	const ffmpegInitResult = await ffmpeg.load({
		coreURL: await toBlobURL(ffmpegCoreURL, "text/javascript"),
		wasmURL: await toBlobURL(ffmpegWasmURL, "application/wasm"),
	});

	return ffmpegInitResult;
}

enum SilkQueueTaskType {
	INIT = "INIT",
	PROCESS = "PROCESS",
}

type SilkQueueTaskProps =
	| {
			task?: SilkQueueTaskType.PROCESS;
			silk: ArrayBuffer;

			onSuccess?: (result: string) => void;
			onError?: (error: unknown) => void;
			onSettled?: () => void;
	  }
	| {
			task: SilkQueueTaskType.INIT;

			onSuccess?: (result: string) => void;
			onError?: (error: unknown) => void;
			onSettled?: () => void;
	  };

async function processQueueItem(item: SilkQueueTaskProps) {
	if (item.task === SilkQueueTaskType.INIT) {
		return await initFFmpeg();
	} else {
		const silk = await decode(item.silk, 24000);

		// const ffmpegInputFilename = `${message.chat.id}|${message.local_id}.pcm`;
		// const ffmpegOutputFilename = `${message.chat.id}|${message.local_id}.wav`;

		// 在只有一个 FFmpeg 实例的情况下，相同的文件名会覆盖，所以使用相同的文件名要注意时序
		const ffmpegInputFilename = `input.pcm`;
		const ffmpegOutputFilename = `output.wav`;

		await ffmpeg.writeFile(ffmpegInputFilename, silk.data);
		await ffmpeg.exec([
			"-y",
			"-f",
			"s16le",
			"-ar",
			"24000",
			"-ac",
			"1",
			"-i",
			ffmpegInputFilename,
			ffmpegOutputFilename,
		]);
		const wav = await ffmpeg.readFile(ffmpegOutputFilename);

		ffmpeg.deleteFile(ffmpegInputFilename);
		ffmpeg.deleteFile(ffmpegOutputFilename);

		// TODO
		// @ts-ignore
		return URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
	}
}

export const silkQueue = new AsyncQueuer<SilkQueueTaskProps>(processQueueItem, {
	onSuccess(result, item) {
		item.onSuccess?.(result);
	},
	onError(error, item) {
		item.onError?.(error);
	},
	onSettled(item) {
		item.onSettled?.();
	},

	// addItemsTo: "back",
	// getItemsFrom: "back", // LIFO, some bug in tanstack pacer (^0.14.0), disable LIFO for now
	getPriority: (item) => (item.task === SilkQueueTaskType.INIT ? 9 : 1),
	concurrency: 1,
	started: true,
});

silkQueue.addItem({
	task: SilkQueueTaskType.INIT,
});

export async function convertSilk(silk: ArrayBuffer): Promise<string> {
	return await new Promise((resolve) => {
		silkQueue.addItem({
			silk,
			onSuccess(result) {
				resolve(result);
			},
		});
	});
}
