import type { DefaultError, MutationOptions } from "@tanstack/react-query";
import type IosBackupAdapter from ".";
import type { AccountType } from "@/schema";

export function LoadDirectoryMutationOptions(
	adapterInstance: IosBackupAdapter,
): MutationOptions<
	unknown,
	DefaultError,
	FileSystemDirectoryHandle | FileList,
	unknown
> {
	return {
		mutationKey: ["iOSBackupAdapter", "loadDirectory"],
		mutationFn: (directoryHandle) =>
			adapterInstance._loadDirectory(directoryHandle),
	};
}

export function LoadAccountDatabaseMutationOptions(
	adapterInstance: IosBackupAdapter,
): MutationOptions<unknown, DefaultError, AccountType, unknown> {
	return {
		mutationKey: ["iOSBackupAdapter", "loadAccountDatabase"],
		mutationFn: (account) => adapterInstance._loadAccountDatabase(account),
	};
}
