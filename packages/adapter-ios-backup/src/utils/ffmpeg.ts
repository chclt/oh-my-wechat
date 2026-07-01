import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

export async function loadFFmpeg() {
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
