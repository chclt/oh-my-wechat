import { groupBy, sortBy } from "es-toolkit";
import { ContactListContctItem } from "./use-contact-list";

export type UseContactAlphabetListReturnValue = {
	alphabet: string;
	list: ContactListContctItem[];
}[];

export default function useContactAlphabetList(
	contactList: ContactListContctItem[],
): UseContactAlphabetListReturnValue {
	const contactListWithSortCriteriaAndGroupCriteria = contactList.map(
		(contactListItem) => {
			const sortCriteria = (
				contactListItem.contact.remarkPinyin ??
				contactListItem.contact.usernamePinyin ??
				""
			).toUpperCase();

			const groupCriteria =
				!sortCriteria[0] ||
				sortCriteria[0].charCodeAt(0) < "A".charCodeAt(0) ||
				sortCriteria[0].charCodeAt(0) > "Z".charCodeAt(0)
					? "#"
					: sortCriteria[0];

			return {
				contactListItem,
				_sortCriteria: sortCriteria,
				_groupCriteria: groupCriteria,
			};
		},
	);

	const sortedContactList = sortBy(
		contactListWithSortCriteriaAndGroupCriteria,
		["_sortCriteria"],
	);

	const groups = Object.entries(
		groupBy(sortedContactList, (contact) => contact._groupCriteria),
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

	return groups.map((item) => ({
		alphabet: item.alphabet,
		list: item.list.map((contactListItem) => contactListItem.contactListItem),
	}));
}
