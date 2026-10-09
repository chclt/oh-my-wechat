import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	copyFileSync,
	cpSync,
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
import { getBuildConfig } from "./ffmpeg.config.mjs";

const host = execFileSync("rustc", ["--print", "host-tuple"], {
	encoding: "utf8",
}).trim();
const target = process.argv[2] || process.env.TAURI_ENV_TARGET_TRIPLE || host;
if (
	target !== host &&
	!(process.platform !== "win32" && target === "x86_64-pc-windows-msvc")
) {
	throw new Error(
		`FFmpeg cross-compilation from ${host} to ${target} is not configured.`,
	);
}
const config = getBuildConfig(target);

const root = fileURLToPath(new URL(".", import.meta.url));
const dist = path.join(root, "dist");
const output = path.join(dist, target);
const binary = target.includes("windows") ? "ffmpeg.exe" : "ffmpeg";
const metadata = path.join(output, "build.json");
if (
	[binary, "LICENSE", "build.json"].every((file) =>
		existsSync(path.join(output, file)),
	) &&
	JSON.stringify(JSON.parse(readFileSync(metadata, "utf8"))) ===
		JSON.stringify(config)
) {
	console.log(`FFmpeg up to date: ${output}`);
	process.exit(0);
}

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

function shellPath(file) {
	if (process.platform !== "win32") return file;
	// Windows builds use MSYS2 UCRT64 (x64) or CLANGARM64 (ARM64).
	return execFileSync("cygpath", ["-u", file], { encoding: "utf8" }).trim();
}

function verify(file, source) {
	const digest = createHash("sha256").update(readFileSync(file)).digest("hex");
	if (digest !== source.sha256) {
		throw new Error(`Source checksum mismatch: ${file}`);
	}
}

function prepareSource(source) {
	const archive = path.join(cache, path.basename(new URL(source.url).pathname));
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
			verify(partial, source);
			renameSync(partial, archive);
		} finally {
			rmSync(partial, { force: true });
		}
	}
	verify(archive, source);
	const directory = path.join(cache, source.sha256);
	if (!existsSync(directory)) {
		const temporary = mkdtempSync(path.join(cache, "extract-"));
		try {
			run("tar", [
				"-xf",
				shellPath(archive),
				"--strip-components=1",
				"-C",
				shellPath(temporary),
			]);
			renameSync(temporary, directory);
		} finally {
			rmSync(temporary, { recursive: true, force: true });
		}
	}
	return directory;
}

const sourceDirectory = prepareSource(config.source);

// FFmpeg also builds host tools; their objects cannot be shared across hosts.
const configuration = createHash("sha256")
	.update(JSON.stringify(config))
	.digest("hex");
const build = path.join(cache, "build", host, target, configuration);
mkdirSync(build, { recursive: true });
if (config.zlib) {
	const zlibSource = prepareSource(config.zlib.source);
	const zlibBuild = path.join(build, "zlib");
	if (!existsSync(zlibBuild))
		cpSync(zlibSource, zlibBuild, { recursive: true });
	run(
		"make",
		[
			"-f",
			"win32/Makefile.gcc",
			...config.zlib.make,
			`-j${availableParallelism()}`,
			"libz.a",
		],
		zlibBuild,
	);
}
run(
	"sh",
	[shellPath(path.join(sourceDirectory, "configure")), ...config.configure],
	build,
);
run("make", [`-j${availableParallelism()}`, binary], build);

mkdirSync(dist, { recursive: true });
const temporary = mkdtempSync(path.join(dist, ".build-"));
try {
	copyFileSync(path.join(build, binary), path.join(temporary, binary));
	copyFileSync(
		path.join(sourceDirectory, "COPYING.LGPLv2.1"),
		path.join(temporary, "LICENSE"),
	);
	if (config.zlib) {
		writeFileSync(
			path.join(temporary, "LICENSE"),
			[
				readFileSync(path.join(temporary, "LICENSE"), "utf8"),
				readFileSync(path.join(build, "zlib", "LICENSE"), "utf8"),
			].join("\n"),
		);
	}
	writeFileSync(
		path.join(temporary, "build.json"),
		`${JSON.stringify(config, null, 2)}\n`,
	);
	rmSync(output, { recursive: true, force: true });
	renameSync(temporary, output);
} finally {
	rmSync(temporary, { recursive: true, force: true });
}
console.log(`FFmpeg prepared: ${output}`);
