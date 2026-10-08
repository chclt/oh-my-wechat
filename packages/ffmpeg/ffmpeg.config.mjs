export const source = {
	version: "9.0.2",
	url: "https://ffmpeg.org/releases/ffmpeg-9.0.2.tar.xz",
	sha256: "8c3850283eb25fa026482078a04051e0be17347b09ef81a0849bec15a96e002e",
};

// Shared by base and plus: PCM/Speex -> WAV, extracted WXGF HEVC -> PNG.
export const configure = [
	"--cc=clang",
	"--arch=aarch64",
	"--target-os=darwin",
	"--extra-cflags=-mmacosx-version-min=11.0",
	"--extra-ldflags=-mmacosx-version-min=11.0",
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
