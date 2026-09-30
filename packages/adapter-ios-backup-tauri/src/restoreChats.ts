import type { ChatType } from "@repo/types";

export function restoreChats(chats: ChatType[]): ChatType[] {
	return chats.map((chat) => ({
		...chat,
		title: chat.title,
		is_pinned: chat.is_pinned,
		...(chat.type === "private"
			? {
					user: chat.user,
					// The web adapter can return undefined for missing contacts.
					// IPC encodes those array slots as null; restore them here.
					members: chat.members.map((member) => member ?? undefined),
				}
			: { chatroom: chat.chatroom }),
	}));
}
