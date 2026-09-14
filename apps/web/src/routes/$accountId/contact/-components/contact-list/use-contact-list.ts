import { ContactType } from "@repo/types";
import { IgnoredContactIds, specialBrandIds } from "@repo/utils";

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
