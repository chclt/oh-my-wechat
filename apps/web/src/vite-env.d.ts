/// <reference types="vite/client" />

interface ViteTypeOptions {
	strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
	readonly TAURI_ENV_PLATFORM?: string;
	readonly TAURI_ENV_DEBUG?: "true";
}
