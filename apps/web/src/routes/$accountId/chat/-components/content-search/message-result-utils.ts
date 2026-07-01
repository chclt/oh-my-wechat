import type { ChatType, ContactType, UserType } from "@repo/types";

export function formatContactTitle({ remark, username }: ContactType): string {
	if (remark && username) {
		return `${remark}（${username}）`;
	}
	return remark ?? username;
}

export function getChatUsers(chat: ChatType | undefined): UserType[] {
	if (!chat) {
		return [];
	}
	if (chat.type === "private") {
		return [chat.user];
	}
	return chat.members;
}

export function getUserDisplayName(user: UserType): string {
	return user.remark ?? user.username ?? user.id;
}
