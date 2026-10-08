import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { configure, source } from "@repo/ffmpeg/config";

const require = createRequire(import.meta.url);
const target = process.argv[2] || process.env.TAURI_ENV_TARGET_TRIPLE;
if (!target) throw new Error("A target triple is required to prepare FFmpeg.");
const root = path.dirname(require.resolve("@repo/ffmpeg/package.json"));
const input = path.join(root, "dist", target);
const directory = fileURLToPath(
	new URL("../src-tauri/binaries/", import.meta.url),
);
const extension = target.includes("windows") ? ".exe" : "";
const files = [
	[`ffmpeg${extension}`, `ffmpeg-${target}${extension}`],
	["LICENSE", "ffmpeg.LICENSE"],
	["build.json", "ffmpeg.build.json"],
];
const instruction = `Run: pnpm --filter @repo/ffmpeg build ${target}`;
for (const [name] of files) {
	if (!existsSync(path.join(input, name))) {
		throw new Error(`FFmpeg for ${target} is not prepared. ${instruction}`);
	}
}
const metadata = JSON.parse(
	readFileSync(path.join(input, "build.json"), "utf8"),
);
if (
	JSON.stringify(metadata) !== JSON.stringify({ source, configure, target })
) {
	throw new Error(`FFmpeg configuration changed. ${instruction}`);
}

// tauri-build watches these files: preserve their mtime when contents match.
mkdirSync(directory, { recursive: true });
for (const [name, output] of files) {
	const from = path.join(input, name);
	const to = path.join(directory, output);
	if (!existsSync(to) || !readFileSync(from).equals(readFileSync(to))) {
		copyFileSync(from, to);
	}
}
