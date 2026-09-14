import type { MessageType } from "@repo/types";

export function createMessageURI({
	message,
	account,
}: {
	message: MessageType;
	account: { id: string };
}) {
	return `omw:account:${account.id}:chat:${message.chat_id}:message:${message.local_id}`;
}
