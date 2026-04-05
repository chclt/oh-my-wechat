import type { SystemMessageType } from "@/schema";

export function parseContent(message: SystemMessageType) {
	return message.message_entity
		.split(/<[^>]+?>/)
		.map((s) => s)
		.join("");
}
