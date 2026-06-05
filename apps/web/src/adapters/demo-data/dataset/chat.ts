import { ChatType, ContactType, UserType } from "@/schema";
import { shuffle } from "es-toolkit";
import {
	user_1,
	user_10,
	user_10_contact,
	user_11,
	user_11_contact,
	user_12,
	user_12_contact,
	user_13,
	user_13_contact,
	user_1_contact,
	user_2,
	user_2_contact,
	user_3,
	user_3_contact,
	user_4,
	user_4_contact,
	user_5,
	user_5_contact,
	user_6,
	user_6_contact,
	user_7,
	user_7_contact,
	user_8,
	user_8_contact,
	user_9,
	user_9_contact,
} from "./user";

function transformContactToChat(
	contact: ContactType,
	user: UserType,
): ChatType {
	return {
		type: "private",
		user: user,
		id: user.id,
		title: contact.remark ?? contact.username,
		photo: user.photo?.thumb,
		is_muted: false,
		is_pinned: false,
		is_collapsed: false,
		members: [user],
	};
}

export const user_1_chat: ChatType = transformContactToChat(
	user_1_contact,
	user_1,
);
export const user_2_chat: ChatType = transformContactToChat(
	user_2_contact,
	user_2,
);
export const user_3_chat: ChatType = transformContactToChat(
	user_3_contact,
	user_3,
);
export const user_4_chat: ChatType = transformContactToChat(
	user_4_contact,
	user_4,
);
export const user_5_chat: ChatType = transformContactToChat(
	user_5_contact,
	user_5,
);
export const user_6_chat: ChatType = transformContactToChat(
	user_6_contact,
	user_6,
);
export const user_7_chat: ChatType = transformContactToChat(
	user_7_contact,
	user_7,
);
export const user_8_chat: ChatType = transformContactToChat(
	user_8_contact,
	user_8,
);
export const user_9_chat: ChatType = transformContactToChat(
	user_9_contact,
	user_9,
);
export const user_10_chat: ChatType = transformContactToChat(
	user_10_contact,
	user_10,
);
export const user_11_chat: ChatType = transformContactToChat(
	user_11_contact,
	user_11,
);
export const user_12_chat: ChatType = transformContactToChat(
	user_12_contact,
	user_12,
);
export const user_13_chat: ChatType = transformContactToChat(
	user_13_contact,
	user_13,
);

export const ChatList = shuffle([
	user_1_chat,
	user_2_chat,
	user_3_chat,
	user_4_chat,
	user_5_chat,
	user_6_chat,
	user_7_chat,
	user_8_chat,
	user_9_chat,
	user_10_chat,
	user_11_chat,
	user_12_chat,
	user_13_chat,
]);
