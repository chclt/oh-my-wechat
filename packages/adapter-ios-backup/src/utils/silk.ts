import { decode } from "silk-wasm";
import { runFFmpeg } from "./ffmpeg";

export function convertSilk(data: ArrayBuffer): Promise<string> {
	return runFFmpeg(async (ffmpeg) => {
		const silk = await decode(data, 24000);

		// 在只有一个 FFmpeg 实例的情况下，相同的文件名会覆盖，所以使用相同的文件名要注意时序
		const ffmpegInputFilename = `input.pcm`;
		const ffmpegOutputFilename = `output.wav`;

		const pcmData = new Uint8Array(silk.data);

		try {
			await ffmpeg.writeFile(ffmpegInputFilename, pcmData);
			const status = await ffmpeg.exec([
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
			if (status !== 0) throw new Error("Silk decoding failed");
			const wav = await ffmpeg.readFile(ffmpegOutputFilename);
			// @ts-expect-error wav is Uint8Array for binary read
			return URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
		} finally {
			await ffmpeg.deleteFile(ffmpegInputFilename).catch(() => {});
			await ffmpeg.deleteFile(ffmpegOutputFilename).catch(() => {});
		}
	});
}
