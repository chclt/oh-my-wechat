import specialBrandIdRaw from "@/assets/specialBrandUserNames.csv?raw";
import { ContactType } from "@/schema";

const specialBrandIds = specialBrandIdRaw.split("\n").map((i) => i.trim());

export type ContactListContctItem = {
	type: "contact";
	id: ContactType["id"];
	title: string;
	photo: string;
	contact: ContactType;
};

export type ContactListContctGroupItem = {
	type: "contactGroup";
	id: ContactType["id"];
	title: string;
	photo: string;
	value: ContactListContctItem[];
};

type UseContactListReturnValue = {
	// 个人微信
	personalAccount: ContactListContctItem[];
	// 保存到通讯录的群聊
	groupChat: ContactListContctItem[];
	// 企业微信联系人
	openIMAccount: ContactListContctItem[];
	// 公众号
	officialAccount: ContactListContctItem[];
	// 服务号
	serviceAccount: ContactListContctItem[];
};

const IgnoredContactIds = [
	"chatroom_session_box", // 折叠的聊天
	"brandsessionholder", // 订阅号消息
	"brandservicesessionholder", // 服务号消息
	"notification_messages", // 服务消息
	"fav_weapp_messages", // 我的小程序消息
	"brandsessionholder_weapp", // 小程序客服消息
	"opencustomerservicemsg", // 小程序客服消息
	"band_ecs_notification_messages", //

	"fmessage", // 朋友推荐消息
	"floatbottle", // 漂流瓶
	"qmessage", // QQ离线消息
	"qqmail", // QQ邮箱提醒
	"iwatchholder", // Apple Watch 助手
	// "iwatchholdernewsapp",
	"newsapp", // 腾讯新闻
	"feedsapp", // 朋友圈
	"masssendapp", // 群发助手
	"blogapp", // 微博阅读
	"voiceinputapp", // 语音输入
	"linkedinplugin", // LinkedIn
	"medianote", // 语音记事本
];

export default function useContactList(
	contactData: ContactType[],
): UseContactListReturnValue {
	const filteredContactList = contactData.filter(
		(contact) =>
			!IgnoredContactIds.includes(contact.id) &&
			!specialBrandIds.includes(contact.id),
	);

	const personalAccountContactItemList: ContactListContctItem[] = [];
	const groupChatContactItemList: ContactListContctItem[] = [];
	const openIMContactItemList: ContactListContctItem[] = [];
	const officialAccountContactItemList: ContactListContctItem[] = [];
	const serviceAccountContactItemList: ContactListContctItem[] = [];

	filteredContactList.forEach((item) => {
		if (item.is_openim) {
			openIMContactItemList.push(transformContactToContactListItem(item));
		} else if (item.id.endsWith("@chatroom")) {
			groupChatContactItemList.push(transformContactToContactListItem(item));
		} else if (item.id.startsWith("gh_")) {
			officialAccountContactItemList.push(
				transformContactToContactListItem(item),
			);
		} else if (item.id.startsWith("mp_")) {
			serviceAccountContactItemList.push(
				transformContactToContactListItem(item),
			);
		} else {
			personalAccountContactItemList.push(
				transformContactToContactListItem(item),
			);
		}
	});

	return {
		personalAccount: personalAccountContactItemList,
		groupChat: groupChatContactItemList,
		openIMAccount: openIMContactItemList,
		officialAccount: officialAccountContactItemList,
		serviceAccount: serviceAccountContactItemList,
	};
}

function transformContactToContactListItem(
	contact: ContactType,
): ContactListContctItem {
	return {
		type: "contact",
		id: contact.id,
		title: contact.remark ?? contact.username ?? "",
		photo: contact.photo?.thumb ?? "",
		contact: contact,
	};
}
