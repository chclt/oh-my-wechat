import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	configure,
	profile,
	sources,
	toolchain,
	upstream,
} from "../ffmpeg.config.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = fileURLToPath(
	new URL("../../../vendor/ffmpeg.wasm/", import.meta.url),
);
const cache = path.join(root, ".cache");
mkdirSync(cache, { recursive: true });
const temporary = mkdtempSync(path.join(cache, "build-"));
try {
	const context = path.join(temporary, "context");
	mkdirSync(context);
	for (const file of [
		"build/ffmpeg.sh",
		"build/ffmpeg-wasm.sh",
		"build/zlib.sh",
		"src/bind",
		"src/fftools",
		"LICENSE",
	]) {
		const destination = path.join(context, "upstream", file);
		mkdirSync(path.dirname(destination), { recursive: true });
		cpSync(path.join(source, file), destination, { recursive: true });
	}
	cpSync(path.join(root, "Dockerfile"), path.join(context, "Dockerfile"));
	cpSync(path.join(root, "patches"), path.join(context, "patches"), {
		recursive: true,
	});
	writeFileSync(
		path.join(context, "configure-flags.txt"),
		`${configure.join("\n")}\n`,
	);
	const output = path.join(temporary, "output");
	const buildArgs = {
		EMSDK_IMAGE: toolchain.image,
		COMPILER_FLAGS: toolchain.compilerFlags,
		FFMPEG_REPOSITORY: sources.ffmpeg.repository,
		FFMPEG_COMMIT: sources.ffmpeg.commit,
		ZLIB_REPOSITORY: sources.zlib.repository,
		ZLIB_COMMIT: sources.zlib.commit,
	};
	execFileSync(
		"docker",
		[
			"buildx",
			"build",
			"--platform",
			toolchain.platform,
			...Object.entries(buildArgs).flatMap(([name, value]) => [
				"--build-arg",
				`${name}=${value}`,
			]),
			"--output",
			`type=local,dest=${output}`,
			context,
		],
		{ stdio: "inherit" },
	);
	writeFileSync(
		path.join(output, "build.json"),
		`${JSON.stringify({ upstream, sources, profile, toolchain, configure }, null, 2)}\n`,
	);
	const artifacts = path.join(root, "artifacts");
	cpSync(output, artifacts, { recursive: true });
	console.log(`Core artifacts prepared: ${artifacts}`);
} finally {
	rmSync(temporary, { recursive: true });
}
