export const upstream = {
	repository: "https://github.com/ffmpegwasm/ffmpeg.wasm.git",
	tag: "v12.15",
	commit: "71aa99d37c02a7b4c435275ca9ef50e612f6efa1",
	coreVersion: "0.12.10",
	wrapperVersion: "0.12.15",
	ffmpegVersion: "n5.1.4",
	emscriptenVersion: "3.1.40",
};

// Media capabilities used by the web adapter.
// Keep HEVC/PNG for Plus compatibility even though base has a WXGF stub.
export const profile = {
	name: "wechat",
	threads: "single",
	format: "esm",
	demuxers: ["pcm_s16le", "ogg", "hevc"],
	decoders: ["pcm_s16le", "speex", "hevc"],
	parsers: ["hevc"],
	encoders: ["pcm_s16le", "png"],
	muxers: ["wav", "image2"],
	filters: ["scale", "aresample"],
	protocols: ["file"],
	externalLibraries: ["zlib"],
};

// Exact revisions of the external sources used by the official build.
export const sources = {
	ffmpeg: {
		repository: "https://github.com/FFmpeg/FFmpeg.git",
		commit: "4729204c17f756e186d622060088371d10b34f7e",
	},
	zlib: {
		repository: "https://github.com/ffmpegwasm/zlib.git",
		version: "v1.2.11",
		commit: "cacf7f1d4e3d44d871b605da3b647f07d718623f",
	},
};

// Match the official production settings and keep its bindings intact.
export const toolchain = {
	platform: "linux/amd64",
	image: `emscripten/emsdk:${upstream.emscriptenVersion}`,
	compilerFlags: "-O3 -msimd128",
};

// --disable-programs in upstream/build/ffmpeg.sh bypasses ffmpeg_select.
// Its separately linked command sources still require these filters.
const commandFilters = [
	"aformat",
	"anull",
	"atrim",
	"format",
	"hflip",
	"null",
	"transpose",
	"trim",
	"vflip",
];

export const configure = [
	"--disable-everything",
	"--disable-network",
	"--disable-postproc",
	"--disable-gpl",
	"--disable-nonfree",
	"--disable-version3",
	"--disable-shared",
	"--enable-static",
	"--enable-small",
	...profile.externalLibraries.map((name) => `--enable-${name}`),
	`--enable-demuxer=${profile.demuxers.join(",")}`,
	`--enable-decoder=${profile.decoders.join(",")}`,
	`--enable-parser=${profile.parsers.join(",")}`,
	`--enable-encoder=${profile.encoders.join(",")}`,
	`--enable-muxer=${profile.muxers.join(",")}`,
	`--enable-filter=${[...commandFilters, ...profile.filters].join(",")}`,
	`--enable-protocol=${profile.protocols.join(",")}`,
];
