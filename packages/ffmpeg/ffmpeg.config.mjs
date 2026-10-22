const source = {
	version: "9.0.2",
	url: "https://ffmpeg.org/releases/ffmpeg-9.0.2.tar.xz",
	sha256: "8c3850283eb25fa026482078a04051e0be17347b09ef81a0849bec15a96e002e",
};

// Shared by base and plus: PCM/Speex -> WAV, extracted WXGF HEVC -> PNG.
const features = [
	"--disable-everything",
	"--disable-autodetect",
	"--disable-network",
	"--disable-gpl",
	"--disable-nonfree",
	"--disable-version3",
	"--disable-shared",
	"--enable-static",
	"--disable-ffplay",
	"--disable-ffprobe",
	"--disable-avdevice",
	"--disable-doc",
	"--disable-debug",
	"--enable-zlib",
	"--enable-protocol=file",
	"--enable-demuxer=pcm_s16le,ogg,hevc",
	"--enable-decoder=pcm_s16le,speex,hevc",
	"--enable-parser=hevc",
	"--enable-encoder=pcm_s16le,png",
	"--enable-muxer=wav,image2",
	// scale preserves plus's BT.601/full-range output; aresample converts Speex PCM.
	"--enable-filter=scale,aresample",
];

export function getBuildConfig(target) {
	let configure;
	switch (target) {
		case "aarch64-apple-darwin":
		case "x86_64-apple-darwin": {
			const minimumVersion =
				target === "aarch64-apple-darwin" ? "11.0" : "10.13";
			configure = [
				"--cc=clang",
				`--arch=${target.split("-")[0]}`,
				"--target-os=darwin",
				`--extra-cflags=-mmacosx-version-min=${minimumVersion}`,
				`--extra-ldflags=-mmacosx-version-min=${minimumVersion}`,
			];
			break;
		}
		default:
			throw new Error(`Unsupported FFmpeg target: ${target}`);
	}
	return {
		source,
		configure: [...configure, ...features],
		target,
	};
}
