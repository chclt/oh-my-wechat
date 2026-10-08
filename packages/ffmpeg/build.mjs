import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { availableParallelism } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { configure, source } from "./ffmpeg.config.mjs";

const target = process.argv[2] || "aarch64-apple-darwin";
if (
	process.platform !== "darwin" ||
	process.arch !== "arm64" ||
	target !== "aarch64-apple-darwin"
) {
	throw new Error("FFmpeg source builds currently support macOS ARM64 only.");
}

const root = fileURLToPath(new URL(".", import.meta.url));
const cache = path.join(root, ".cache");
mkdirSync(cache, { recursive: true });

function run(command, args, cwd = root) {
	const result = spawnSync(command, args, {
		cwd,
		stdio: "inherit",
		env: { ...process.env, LC_ALL: "C" },
	});
	if (result.error) throw result.error;
	if (result.status !== 0)
		throw new Error(`${command} failed (${result.status})`);
}

const archive = path.join(cache, `ffmpeg-${source.version}.tar.xz`);
if (!existsSync(archive)) {
	const partial = `${archive}.part`;
	try {
		run("curl", [
			"--fail",
			"--location",
			"--retry",
			"2",
			source.url,
			"-o",
			partial,
		]);
		verify(partial);
		renameSync(partial, archive);
	} finally {
		rmSync(partial, { force: true });
	}
}
verify(archive);

function verify(file) {
	const digest = createHash("sha256").update(readFileSync(file)).digest("hex");
	if (digest !== source.sha256) {
		throw new Error(`FFmpeg source checksum mismatch: ${file}`);
	}
}

const sourceDirectory = path.join(cache, source.sha256);
if (!existsSync(sourceDirectory)) {
	const temporary = mkdtempSync(path.join(cache, "extract-"));
	try {
		run("tar", ["-xf", archive, "--strip-components=1", "-C", temporary]);
		renameSync(temporary, sourceDirectory);
	} finally {
		rmSync(temporary, { recursive: true, force: true });
	}
}

// Separate configurations cannot reuse incompatible object files.
const configuration = createHash("sha256")
	.update(JSON.stringify({ source, configure, target }))
	.digest("hex");
const build = path.join(cache, "build", target, configuration);
mkdirSync(build, { recursive: true });
run(path.join(sourceDirectory, "configure"), configure, build);
run("make", [`-j${availableParallelism()}`, "ffmpeg"], build);

const dist = path.join(root, "dist");
mkdirSync(dist, { recursive: true });
const temporary = mkdtempSync(path.join(dist, ".build-"));
try {
	copyFileSync(path.join(build, "ffmpeg"), path.join(temporary, "ffmpeg"));
	copyFileSync(
		path.join(sourceDirectory, "COPYING.LGPLv2.1"),
		path.join(temporary, "LICENSE"),
	);
	writeFileSync(
		path.join(temporary, "build.json"),
		`${JSON.stringify({ source, configure, target }, null, 2)}\n`,
	);
	rmSync(path.join(dist, target), { recursive: true, force: true });
	renameSync(temporary, path.join(dist, target));
} finally {
	rmSync(temporary, { recursive: true, force: true });
}
console.log(`FFmpeg prepared: ${path.join(dist, target)}`);
