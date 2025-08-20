import { AsyncQueuer } from "@tanstack/pacer";
import { decode } from "silk-wasm";
import { ffmpeg, initFFmpeg } from "./ffmpeg";

type SilkQueueItemProps = {
	silk: ArrayBuffer;

	onSuccess?: (result: string) => void;
	onError?: (error: unknown) => void;
	onSettled?: () => void;
};

async function processQueueItem(item: SilkQueueItemProps) {
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

initFFmpeg()
	.then(() => {
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
