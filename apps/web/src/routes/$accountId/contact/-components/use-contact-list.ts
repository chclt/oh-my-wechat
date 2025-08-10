import { ContactType } from "@/schema";
import { de } from "date-fns/locale";
import { groupBy, sortBy } from "es-toolkit";

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

export default function useContactList(
	contactData: ContactType[],
): UseContactListReturnValue {
	const contactListWithSortCriteriaAndGroupCriteria = contactData.map(
		(contact) => {
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
		},
	);

	// const sortedContactList = contactListWithAlphabet.sort((a, b) => {
	// 	const compareA = a._alphabet.charCodeAt(0);
	// 	const compareB = b._alphabet.charCodeAt(0);
	// 	return compareA - compareB;
	// });

	const sortedContactList = sortBy(
		contactListWithSortCriteriaAndGroupCriteria,
		["_sortCriteria"],
	);

	const alphabetContactList = Object.entries(
		groupBy(sortedContactList, (contact) => contact._groupCriteria),
	).map(([alphabet, list]) => ({
		alphabet,
		list,
	}));

	const tempIndex = alphabetContactList.findIndex(
		(item) => item.alphabet === "#",
	);

	if (tempIndex !== -1) {
		const lastItem = alphabetContactList[tempIndex];
		alphabetContactList.splice(tempIndex, 1);
		alphabetContactList.push(lastItem);
	}

	return {
		personalAccountAlphabetList: alphabetContactList,
	};
}
