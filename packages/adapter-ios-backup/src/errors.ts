export type BackupErrorName =
	| "BackupPasswordRequiredError"
	| "BackupPasswordError"
	| "InvalidBackupError"
	| "UnsupportedBackupError"
	| "UnsupportedBackupBrowserError"
	| "MissingBackupManifestError"
	| "MissingWechatDataError";

/** Comlink preserves Error.name; presentation belongs to the client. */
export function createBackupError(
	name: BackupErrorName,
	message: string,
): Error {
	const error = new Error(message);
	error.name = name;
	return error;
}

export function createInvalidBackupError(message: string): Error {
	return createBackupError("InvalidBackupError", message);
}
