import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

// import ffmpegCoreURL from "@ffmpeg/core?url";
// import ffmpegWasmURL from "@ffmpeg/core/wasm?url";

const ffmpegCoreURL =
	"https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js";
const ffmpegWasmURL =
	"https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm";

export const ffmpeg = new FFmpeg();

export async function initFFmpeg() {
	const ffmpegInitResult = await ffmpeg.load({
		coreURL: await toBlobURL(ffmpegCoreURL, "text/javascript"),
		wasmURL: await toBlobURL(ffmpegWasmURL, "application/wasm"),
	});

	return ffmpegInitResult;
}
