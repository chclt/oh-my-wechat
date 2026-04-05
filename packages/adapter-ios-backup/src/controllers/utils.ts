/**
 * account:                 ios-backup:account:<accountId>
 * chat:                    ios-backup:account:<accountId>:chat:<chatId>
 * message:                 ios-backup:account:<accountId>:chat:<chatId>:message:<messageLocalId>
 * image in image message:  ios-backup:account:<accountId>:chat:<chatId>:message:<messageLocalId>:image:<filename>
 * video in video message:  ios-backup:account:<accountId>:chat:<chatId>:message:<messageLocalId>:video:<filename>
 * voice in voice message:  ios-backup:account:<accountId>:chat:<chatId>:message:<messageLocalId>:voice:<filename>
 * file in file message:    ios-backup:account:<accountId>:chat:<chatId>:message:<messageLocalId>:file:<filename>
 */

interface CreateUriParams {
	accountId: string;
	chatId: string;
	messageLocalId: string;
	resourceType: string;
	resourceName: string;
}

export function createUri({
	accountId,
	chatId,
	messageLocalId,
	resourceType,
	resourceName,
}: CreateUriParams) {
	return `ios-backup:account:${accountId}:chat:${chatId}:message:${messageLocalId}:${resourceType}:${resourceName}`;
}

export function parseUri(uri: string): Record<string, string> | null {
	const prefix = "ios-backup:";
	if (!uri.startsWith(prefix)) return null;

	const segments = uri.slice(prefix.length).split(":");
	const result: Record<string, string> = {};

	for (let i = 0; i < segments.length - 1; i += 2) {
		result[segments[i]] = segments[i + 1];
	}

	return result;
}
