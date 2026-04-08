import type { SystemMessageType } from "@repo/types";

export function parseContent(message: SystemMessageType) {
	return message.message_entity
		.split(/<[^>]+?>/)
		.map((s) => s)
		.join("");
}
