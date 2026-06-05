import { MessageType, SystemMessageType } from "@/schema";
import { user_1_chat } from "./chat";
import { user_1 } from "./user";

let message_local_id = 0;
export const user_1_message: MessageType[] = [
	{
		id: "0",
		local_id: `${message_local_id++}`,
		type: 10000,
		date: 1699525328,
		direction: 1,
		from: user_1,
		chat_id: user_1_chat.id,
		raw_message: `你已添加了${user_1.username}，现在可以开始聊天了。`,
		message_entity: `你已添加了${user_1.username}，现在可以开始聊天了。`,
	} satisfies SystemMessageType,
];
