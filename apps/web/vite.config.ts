import path from "path";
import adapterIosBackupVitePresets from "@repo/adapter-ios-backup/vite";
import typesPresets from "@repo/types/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const tauriDebug = process.env.TAURI_ENV_DEBUG === "true";
// Keep mode="tauri" for adapter selection; NODE_ENV controls Vite/React dev code.
if (tauriDebug) process.env.NODE_ENV = "development";

// https://vitejs.dev/config/
export default defineConfig({
	envPrefix: ["VITE_", "TAURI_ENV_"],
	worker: { format: "es" },
	plugins: [
		typesPresets(),
		adapterIosBackupVitePresets(),
		devtools({
			enhancedLogs: {
				enabled: false,
			},
			injectSource: {
				enabled: false,
			},
		}),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		tailwindcss(),
		react({
			babel: {
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		minify: tauriDebug ? false : undefined,
		sourcemap: tauriDebug,
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					if (id.includes("node_modules")) {
						return "vendor";
					} else {
						return "index";
					}
				},
			},
		},
	},
});
