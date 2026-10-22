import type { AccountType } from "@repo/types";
import { mutationOptions } from "@tanstack/react-query";
import type IosBackupAdapter from ".";

export function LoadDirectoryMutationOptions(
	adapterInstance: IosBackupAdapter,
) {
	return mutationOptions({
		mutationKey: ["iOSBackupAdapter", "loadDirectory"],
		retry: false,
		mutationFn: ({
			directory,
			password,
		}: {
			directory: FileSystemDirectoryHandle | FileList;
			password?: string;
		}) => adapterInstance._loadDirectory(directory, password),
	});
}

export function LoadAccountDatabaseMutationOptions(
	adapterInstance: IosBackupAdapter,
) {
	return mutationOptions({
		mutationKey: ["iOSBackupAdapter", "loadAccountDatabase"],
		mutationFn: (account: AccountType) =>
			adapterInstance._loadAccountDatabase(account),
	});
}
