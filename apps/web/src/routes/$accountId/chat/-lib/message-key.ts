/** Stable message identity within the current backup/account. */
export function getMessageKey(chatId: string, messageLocalId: string): string {
	return JSON.stringify([chatId, messageLocalId]);
}
