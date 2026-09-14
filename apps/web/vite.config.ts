import path from "path";
import adapterIosBackupVitePresets from "@repo/adapter-ios-backup/vite";
import typesPresets from "@repo/types/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
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
