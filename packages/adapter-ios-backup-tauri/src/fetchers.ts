import type { AccountType } from "@repo/types";
import { mutationOptions } from "@tanstack/react-query";
import type IosBackupTauriAdapter from ".";

export function LoadDirectoryMutationOptions(
	adapterInstance: IosBackupTauriAdapter,
) {
	return mutationOptions({
		mutationKey: ["iOSBackupTauriAdapter", "loadDirectory"],
		retry: false,
		mutationFn: ({
			directory,
			password,
		}: {
			directory: string;
			password?: string;
		}) => adapterInstance._loadDirectory(directory, password),
	});
}

export function LoadAccountDatabaseMutationOptions(
	adapterInstance: IosBackupTauriAdapter,
) {
	return mutationOptions({
		mutationKey: ["iOSBackupTauriAdapter", "loadAccountDatabase"],
		mutationFn: (account: AccountType) =>
			adapterInstance._loadAccountDatabase(account),
	});
}
