import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

// import ffmpegCoreURL from "@ffmpeg/core?url";
// import ffmpegWasmURL from "@ffmpeg/core/wasm?url";

const ffmpegCoreURL =
	"https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js";
const ffmpegWasmURL =
	"https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm";

export async function loadFFmpeg() {
	const [coreURL, wasmURL] = await Promise.all([
		toBlobURL(ffmpegCoreURL, "text/javascript"),
		toBlobURL(ffmpegWasmURL, "application/wasm"),
	]);
	const ffmpeg = new FFmpeg();
	await ffmpeg.load({ coreURL, wasmURL });
	return ffmpeg;
}
