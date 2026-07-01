import path from "path";
import type { Plugin, UserConfig } from "vite";
import wasm from "vite-plugin-wasm";
import packageJson from "../../package.json" with { type: "json" };

const SRC_PATH = path.resolve(import.meta.dirname, "..");

export default function vitePresets(): Plugin[] {
	return [
		{
			name: `${packageJson.name}:alias`,
			resolveId: {
				order: "pre",
				async handler(source, importer, options) {
					if (!source.startsWith("@/") || !importer) return;
					if (!importer.startsWith(SRC_PATH + "/")) return;

					const resolved = path.join(SRC_PATH, source.slice(2));
					return this.resolve(resolved, importer, {
						...options,
						skipSelf: true,
					});
				},
			},
		},
		{
			name: `${packageJson.name}:optimize-deps`,
			config(config: UserConfig) {
				config.optimizeDeps ??= {};
				config.optimizeDeps.exclude ??= [];
				for (const dep of [
					"@ffmpeg/ffmpeg",
					"@ffmpeg/util",
					"silk-wasm",
					"@sqlite.org/sqlite-wasm",
				]) {
					if (!config.optimizeDeps.exclude.includes(dep)) {
						config.optimizeDeps.exclude.push(dep);
					}
				}
			},
		},
		wasm(),
	];
}
