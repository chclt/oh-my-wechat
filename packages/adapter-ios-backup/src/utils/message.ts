import type { UserType } from "@repo/types";

/** Split an incoming group message in the senderId:\ncontent format. */
export function splitGroupMessageContent(message: string) {
	const separatorPosition = message.indexOf(":\n");
	return {
		senderId: message.slice(0, separatorPosition),
		content: message.slice(separatorPosition + 2),
	};
}

export function createUnknownMessageSender(senderId: string): UserType {
	// Some group members have messages but no contact record in the backup.
	return {
		id: senderId,
		user_id: senderId,
		username: senderId,
		is_openim: false,
	};
}
