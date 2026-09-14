import type { ChatType } from "@repo/types";
import { specialBrandIds } from "./specialBrandIds.ts";

const specialBrandIdSet = new Set(specialBrandIds);
const ignoredChatIds = new Set([
	"brandsessionholder", // 订阅号消息
	"brandservicesessionholder", // 服务号消息
	"notification_messages", // 服务消息
	"brandsessionholder_weapp", // 小程序客服消息
	"opencustomerservicemsg", // 小程序客服消息
	"newsapp", // 腾讯新闻
	"masssendapp", // 群发助手
]);

export function isChatVisible(
	chat: Pick<ChatType, "id" | "is_collapsed">,
): boolean {
	return !(
		chat.id.endsWith("@openim") ||
		specialBrandIdSet.has(chat.id) ||
		ignoredChatIds.has(chat.id) ||
		chat.is_collapsed ||
		chat.id.startsWith("gh_")
	);
}
