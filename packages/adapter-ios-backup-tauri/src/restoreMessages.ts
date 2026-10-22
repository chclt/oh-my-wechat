import type { MessageType } from "@repo/types";

export function restoreMessages(messages: MessageType[]): MessageType[] {
	return messages.map(restoreMessage);
}

function restoreMessage(message: MessageType): MessageType {
	return {
		...message,
		// JSON omits a missing sender; the web adapter keeps an undefined property.
		from: message.from,
		...("reply_to_message" in message
			? {
					// An unresolved reference crosses IPC as null.
					reply_to_message: message.reply_to_message
						? restoreMessage(message.reply_to_message)
						: undefined,
				}
			: {}),
	};
}
