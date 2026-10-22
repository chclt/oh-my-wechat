const source = {
	version: "9.0.2",
	url: "https://ffmpeg.org/releases/ffmpeg-9.0.2.tar.xz",
	sha256: "8c3850283eb25fa026482078a04051e0be17347b09ef81a0849bec15a96e002e",
};

const zlibSource = {
	version: "1.3.2",
	url: "https://zlib.net/fossils/zlib-1.3.2.tar.gz",
	sha256: "bb329a0a2cd0274d05519d61c667c062e06990d72e125ee2dfa8de64f0119d16",
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
	let zlib;
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
		case "x86_64-pc-windows-msvc":
			// The standalone sidecar can use MinGW while the Tauri app uses MSVC.
			configure =
				process.platform === "win32"
					? ["--cc=gcc"]
					: ["--enable-cross-compile", "--cross-prefix=x86_64-w64-mingw32-"];
			configure.push("--arch=x86_64");
			zlib = {
				source: zlibSource,
				make:
					process.platform === "win32"
						? ["CC=gcc", "AR=ar"]
						: ["PREFIX=x86_64-w64-mingw32-"],
			};
			break;
		case "aarch64-pc-windows-msvc":
			// MSYS2 CLANGARM64 provides native Windows ARM64 tools.
			configure = [
				"--cc=clang",
				"--arch=aarch64",
				"--ar=llvm-ar",
				"--nm=llvm-nm",
				"--ranlib=llvm-ranlib",
				"--strip=llvm-strip",
			];
			zlib = { source: zlibSource, make: ["CC=clang", "AR=llvm-ar"] };
			break;
		default:
			throw new Error(`Unsupported FFmpeg target: ${target}`);
	}
	if (zlib) {
		configure.push(
			"--target-os=mingw32",
			"--extra-cflags=-I./zlib",
			"--extra-ldflags=-L./zlib -static",
			"--pkg-config=false",
		);
	}
	return {
		source,
		configure: [...configure, ...features],
		target,
		...(zlib ? { zlib } : {}),
	};
}
