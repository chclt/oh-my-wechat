import { ContactType } from "@/schema";
import { groupBy, sortBy } from "es-toolkit";
import specialBrandIdRaw from "@/assets/specialBrandUserNames.csv?raw";

const specialBrandIds = specialBrandIdRaw.split("\n").map((i) => i.trim());

type ContactTypeWithSortAndGroupCriteria = ContactType & {
	_sortCriteria: string;
	_groupCriteria: string;
};

type AlphabetList<DataType> = {
	alphabet: string;
	list: DataType[];
}[];

// 个人微信
interface PersonalAccountContactGroup {
	id: "PersonalAccount";
	alphabetList: AlphabetList<ContactType>;
}

// 保存到通讯录的群聊
interface GroupChatContactGroup {
	id: "GroupChat";
	list: ContactType[];
}

// 公众号
interface OfficialAccountContactGroup {
	id: "OfficialAccount";
	alphabetList: AlphabetList<ContactType>;
}

// 服务号
interface ServiceAccountContactGroup {
	id: "ServiceAccount";
	alphabetList: AlphabetList<ContactType>;
}

type UseContactListReturnValue = {
	personalAccountAlphabetList: AlphabetList<ContactType>;
	// groupChatList: GroupChatContactGroup;
	// officialAccountList: OfficialAccountContactGroup;
	// serviceAccountList: ServiceAccountContactGroup;
};

const ContactListFilter = [
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
	const contactListWithSortCriteriaAndGroupCriteria = contactData
		.filter(
			(contact) =>
				!ContactListFilter.includes(contact.id) &&
				!specialBrandIds.includes(contact.id),
		)
		.map((contact) => {
			const sortCriteria = (
				contact.remarkPinyin ??
				contact.usernamePinyin ??
				""
			).toUpperCase();

			const groupCriteria =
				!sortCriteria[0] ||
				sortCriteria[0].charCodeAt(0) < "A".charCodeAt(0) ||
				sortCriteria[0].charCodeAt(0) > "Z".charCodeAt(0)
					? "#"
					: sortCriteria[0];

			return {
				...contact,
				_sortCriteria: sortCriteria,
				_groupCriteria: groupCriteria,
			};
		});

	const sortedContactList = sortBy(
		contactListWithSortCriteriaAndGroupCriteria,
		["_sortCriteria"],
	);

	const sortedPersonalAccountContactList: ContactTypeWithSortAndGroupCriteria[] =
		[];
	const sortedOpenIMContactList: ContactTypeWithSortAndGroupCriteria[] = [];
	const sortedOfficialAccountContactList: ContactTypeWithSortAndGroupCriteria[] =
		[];
	const sortedServiceAccountContactList: ContactTypeWithSortAndGroupCriteria[] =
		[];

	sortedContactList.forEach((item) => {
		if (item.is_openim) {
			sortedOpenIMContactList.push(item);
		} else if (item.id.startsWith("gh_")) {
			sortedOfficialAccountContactList.push(item);
		} else {
			sortedPersonalAccountContactList.push(item);
		}
	});

	return {
		personalAccountAlphabetList: groupByAlphabet(
			sortedPersonalAccountContactList,
		),
		openIMAlphabetList: groupByAlphabet(sortedOpenIMContactList),
		officialAccountAlphabetList: groupByAlphabet(
			sortedOfficialAccountContactList,
		),
		serviceAccountAlphabetList: groupByAlphabet(
			sortedServiceAccountContactList,
		),
	};
}

function groupByAlphabet(
	contactList: (ContactType & { _groupCriteria: string })[],
) {
	const groups = Object.entries(
		groupBy(contactList, (contact) => contact._groupCriteria),
	).map(([alphabet, list]) => ({
		alphabet,
		list,
	}));

	const tempIndex = groups.findIndex((item) => item.alphabet === "#");

	if (tempIndex !== -1) {
		const lastItem = groups[tempIndex];
		groups.splice(tempIndex, 1);
		groups.push(lastItem);
	}

	return groups;
}
