import IosBackupAdapter from "@repo/adapter-ios-backup";
import IosBackupTauriAdapter from "@repo/adapter-ios-backup-tauri";
import {
	LoadAccountDatabaseMutationOptions as LoadTauriAccountDatabaseMutationOptions,
	LoadDirectoryMutationOptions as LoadTauriDirectoryMutationOptions,
} from "@repo/adapter-ios-backup-tauri/queryOptions";
import {
	LoadAccountDatabaseMutationOptions,
	LoadDirectoryMutationOptions,
} from "@repo/adapter-ios-backup/queryOptions";
import type { AccountType } from "@repo/types";
import type { DataAdapter } from "@repo/types/adapter";
import {
	useMutation,
	type UseMutationOptions,
	type UseMutationResult,
} from "@tanstack/react-query";
import { useRef } from "react";
import { clearDataAdapter, setDataAdapter } from "@/lib/data-adapter";
import type { FileDownloads } from "@/lib/download-message-file";
import { isTauri } from "@/lib/platform";
import {
	createBrowserDownloads,
	createDesktopDownloads,
} from "./file-downloads";

interface UseBackupAdapterOptions {
	onDirectoryLoaded: () => Promise<void>;
	onDirectoryError: (error: Error) => void;
}

function useAdapterMutations<
	TDirectory extends FileSystemDirectoryHandle | FileList | string,
>(
	adapter: DataAdapter,
	createDownloads: () => FileDownloads,
	directoryOptions: UseMutationOptions<
		void,
		Error,
		{ directory: TDirectory; password?: string }
	>,
	accountOptions: UseMutationOptions<void, Error, AccountType>,
	{ onDirectoryLoaded, onDirectoryError }: UseBackupAdapterOptions,
) {
	const loadDirectoryMutation = useMutation({
		...directoryOptions,
		onMutate: () => setDataAdapter(adapter, createDownloads),
		onSuccess: onDirectoryLoaded,
		onError: async (error) => {
			try {
				await clearDataAdapter(adapter);
			} finally {
				onDirectoryError(error);
			}
		},
	});
	const loadAccountDatabaseMutation = useMutation(accountOptions);

	return {
		// 入口保证目录选择器与适配器匹配；公共流程只透传目录，重试时复用原值。
		loadDirectoryMutation: loadDirectoryMutation as UseMutationResult<
			void,
			Error,
			{
				directory: FileSystemDirectoryHandle | FileList | string;
				password?: string;
			}
		>,
		loadAccountDatabaseMutation,
	};
}

function useBrowserBackupAdapter(options: UseBackupAdapterOptions) {
	const adapterRef = useRef<IosBackupAdapter | null>(null);
	if (adapterRef.current === null) {
		adapterRef.current = new IosBackupAdapter();
	}
	const adapter = adapterRef.current;
	const mutations = useAdapterMutations(
		adapter,
		createBrowserDownloads,
		LoadDirectoryMutationOptions(adapter),
		LoadAccountDatabaseMutationOptions(adapter),
		options,
	);
	return { target: "web" as const, ...mutations };
}

function useTauriBackupAdapter(options: UseBackupAdapterOptions) {
	const adapterRef = useRef<IosBackupTauriAdapter | null>(null);
	if (adapterRef.current === null) {
		adapterRef.current = new IosBackupTauriAdapter();
	}
	const adapter = adapterRef.current;
	const mutations = useAdapterMutations(
		adapter,
		createDesktopDownloads,
		LoadTauriDirectoryMutationOptions(adapter),
		LoadTauriAccountDatabaseMutationOptions(adapter),
		options,
	);
	return { target: "tauri" as const, ...mutations };
}

export const useBackupAdapter = isTauri
	? useTauriBackupAdapter
	: useBrowserBackupAdapter;
