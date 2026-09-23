import type { AccountType } from "@repo/types";
import type { DefaultError, MutationOptions } from "@tanstack/react-query";
import type IosBackupAdapter from ".";

export function LoadDirectoryMutationOptions(
	adapterInstance: IosBackupAdapter,
): MutationOptions<
	unknown,
	DefaultError,
	{ directory: FileSystemDirectoryHandle | FileList; password?: string },
	unknown
> {
	return {
		mutationKey: ["iOSBackupAdapter", "loadDirectory"],
		retry: false,
		mutationFn: ({ directory, password }) =>
			adapterInstance._loadDirectory(directory, password),
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
