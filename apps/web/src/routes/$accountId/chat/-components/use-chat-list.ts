import { ChatType } from "@/schema";
import specialBrandIdRaw from "@/assets/specialBrandUserNames.csv?raw";
const specialBrandIds = specialBrandIdRaw.split("\n").map((i) => i.trim());

const ChatListFilter = [
	"chatroom_session_box", // 折叠的聊天
	"brandsessionholder", // 订阅号消息
	"brandservicesessionholder", // 服务号消息
	"notification_messages", // 服务消息
	"brandsessionholder_weapp", // 小程序客服消息
	"opencustomerservicemsg", // 小程序客服消息

	"newsapp", // 腾讯新闻
	"masssendapp", // 群发助手
];

export default function useChatList(chatData: ChatType[]) {
	const data = chatData
		.filter(
			(chat) =>
				!(
					chat.id.startsWith("gh_") ||
					chat.id.endsWith("@openim") || // TODO
					specialBrandIds.includes(chat.id) ||
					ChatListFilter.includes(chat.id)
				),
		)
		.sort((i) => (i.is_pinned ? -1 : 0));

	return data;
}
