import { ChatType } from "@/schema";

import imageCollapsedChats from "/public/images/avatar/collapsed_chats.png";

import specialBrandIdRaw from "@/assets/specialBrandUserNames.csv?raw";
const specialBrandIds = specialBrandIdRaw.split("\n").map((i) => i.trim());

const ChatListFilter = [
	// "chatroom_session_box", // 折叠的聊天
	"brandsessionholder", // 订阅号消息
	"brandservicesessionholder", // 服务号消息

	"notification_messages", // 服务消息
	"brandsessionholder_weapp", // 小程序客服消息
	"opencustomerservicemsg", // 小程序客服消息

	"newsapp", // 腾讯新闻
	"masssendapp", // 群发助手
];

export default function useChatList(chatData: ChatType[]) {
	// 折叠的聊天
	const collapsedChatGroup: ChatType[] = [];
	let collapsedGroupIndex = -1;

	// 公众号消息
	const officalAccountChats: ChatType[] = [];
	const officalAccountChatGroupIndex = -1;

	// 服务号消息
	const serviceAccountChats: ChatType[] = [];
	let serviceAccountChatGroupIndex = -1;

	let filteredChatIndex = 0;
	const data = chatData
		.sort((i) => (i.is_pinned ? -1 : 0))
		.filter((chat) => {
			if (
				!(
					chat.id.endsWith("@openim") || // TODO
					specialBrandIds.includes(chat.id) ||
					ChatListFilter.includes(chat.id) ||
					// 折叠的聊天
					chat.is_collapsed ||
					// 公众号消息
					chat.id.startsWith("gh_")
				)
			) {
				if (chat.id === "chatroom_session_box") {
					// 折叠的聊天
					collapsedGroupIndex = filteredChatIndex;
				} else if (chat.id === "brandservicesessionholder") {
					// 订阅号消息
					serviceAccountChatGroupIndex = filteredChatIndex;
				}

				filteredChatIndex++;
				return true;
			} else {
				if (chat.is_collapsed) {
					// 折叠的聊天
					collapsedChatGroup.push(chat);
				} else if (chat.id.startsWith("gh_")) {
					// 服务号消息
					serviceAccountChats.push(chat);
				}

				return false;
			}
		});

	// 折叠的聊天
	if (collapsedGroupIndex !== -1) {
		data.splice(collapsedGroupIndex, 1, {
			...data[collapsedGroupIndex],
			type: "chatList",
			photo: imageCollapsedChats,
			chats: collapsedChatGroup,
		});
	}

	// 服务号消息 老版本的微信不对服务号进行分组，但是在这里我想要默认进行分组
	// TODO: 服务号的消息还不支持，先不展示
	/* if (serviceAccountChatGroupIndex === -1) {
		data.splice(0, 0, {
			id: "brandservicesessionholder",
			title: "服务号",
			type: "chatList",
			chats: serviceAccountChats,
		});
	} else */
	if (serviceAccountChatGroupIndex !== -1) {
		data.splice(serviceAccountChatGroupIndex, 1, {
			...data[serviceAccountChatGroupIndex],
			type: "chatList",
			chats: serviceAccountChats,
		});
	}

	return data;
}
