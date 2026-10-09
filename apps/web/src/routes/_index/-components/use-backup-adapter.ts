import IosBackupAdapter from "@repo/adapter-ios-backup";
import {
	LoadAccountDatabaseMutationOptions,
	LoadDirectoryMutationOptions,
} from "@repo/adapter-ios-backup/queryOptions";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { setDataAdapter } from "@/lib/data-adapter";

interface UseBackupAdapterOptions {
	onDirectoryLoaded: () => Promise<void>;
	onDirectoryError: (error: Error) => void;
}

export function useBackupAdapter({
	onDirectoryLoaded,
	onDirectoryError,
}: UseBackupAdapterOptions) {
	const adapterRef = useRef<IosBackupAdapter | null>(null);
	if (adapterRef.current === null) {
		adapterRef.current = new IosBackupAdapter();
	}
	const adapter = adapterRef.current;

	const loadDirectoryMutation = useMutation({
		...LoadDirectoryMutationOptions(adapter),
		onMutate: () => setDataAdapter(adapter),
		onSuccess: onDirectoryLoaded,
		onError: onDirectoryError,
	});
	const loadAccountDatabaseMutation = useMutation(
		LoadAccountDatabaseMutationOptions(adapter),
	);

	return { loadDirectoryMutation, loadAccountDatabaseMutation };
}
