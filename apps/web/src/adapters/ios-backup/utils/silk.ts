import { loadFFmpeg } from "@/adapters/ios-backup/utils/ffmpeg";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { AsyncQueuer } from "@tanstack/pacer";
import { decode } from "silk-wasm";

let ffmpeg: FFmpeg | undefined;

type SilkQueueItemProps = {
	silk: ArrayBuffer;

	onSuccess?: (result: string) => void;
	onError?: (error: unknown) => void;
	onSettled?: () => void;
};

async function processQueueItem(item: SilkQueueItemProps) {
	if (!ffmpeg) throw new Error("FFmpeg is not loaded");

	const silk = await decode(item.silk, 24000);

	// 在只有一个 FFmpeg 实例的情况下，相同的文件名会覆盖，所以使用相同的文件名要注意时序
	const ffmpegInputFilename = `input.pcm`;
	const ffmpegOutputFilename = `output.wav`;

	const pcmData = new Uint8Array(silk.data);

	await ffmpeg.writeFile(ffmpegInputFilename, pcmData);
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
	await ffmpeg.deleteFile(ffmpegInputFilename);
	await ffmpeg.deleteFile(ffmpegOutputFilename);
	// @ts-expect-error wav is Uint8Array for binary read
	return URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
}

export const silkQueue = new AsyncQueuer<SilkQueueItemProps>(processQueueItem, {
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
	concurrency: 1,
	started: false,
});

loadFFmpeg()
	.then((ffmpegInstance) => {
		ffmpeg = ffmpegInstance;
		silkQueue.start();
	})
	.catch((error) => {
		console.error(error);
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
