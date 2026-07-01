import { AccountType, ContactType } from "@repo/types";
import {
	DataAdapterPagination,
	GetAccountContactListRequest,
} from "@repo/types/adapter";
import {
	infiniteQueryOptions,
	UseQueryOptions,
	UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import queryClient from "@/lib/query-client.ts";
import {
	IgnoredContactIds,
	specialBrandIds,
} from "@/routes/$accountId/contact/-components/contact-list/use-contact-list.ts";
import { getDataAdapter } from "../data-adapter";

export function AccountContactListQueryOptions(
	requestData: GetAccountContactListRequest,
): UseQueryOptions<ContactType[]> {
	return {
		queryKey: [`account: ${requestData.account.id}`, "ContactList"],
		queryFn: () =>
			getDataAdapter()
				.getAccountContactList(requestData)
				.then((res) => res.data),
	};
}

export function AccountContactListSuspenseQueryOptions(
	requestData: GetAccountContactListRequest,
): UseSuspenseQueryOptions<ContactType[]> {
	return {
		queryKey: [`account: ${requestData.account.id}`, "ContactList"],
		queryFn: () =>
			getDataAdapter()
				.getAccountContactList(requestData)
				.then((res) => res.data),
	};
}

export function SearchAccountContactInfiniteQueryOptions(requestData: {
	account: Pick<AccountType, "id">;
	query: string;
	limit: number;
}) {
	return infiniteQueryOptions({
		queryKey: [
			`account: ${requestData.account.id}`,
			"SearchContact",
			requestData,
		],
		queryFn: async ({ pageParam }) => {
			const normalizedQuery = requestData.query.toLocaleLowerCase();

			const contactsList = await queryClient.ensureQueryData(
				AccountContactListQueryOptions({
					account: { id: requestData.account.id },
				}),
			);

			const filteredContacts = contactsList.filter(
				(contactItem) =>
					!(
						IgnoredContactIds.includes(contactItem.id) ||
						specialBrandIds.includes(contactItem.id) ||
						contactItem.is_openim ||
						contactItem.id.startsWith("gh_") ||
						contactItem.id.startsWith("mp_")
					),
			);

			// TODO: 关联性排序
			const matchedContacts = filteredContacts.filter((contactItem) =>
				[
					contactItem.username,
					contactItem.usernamePinyin,
					contactItem.remark,
					contactItem.remarkPinyin,
					contactItem.remarkPinyinInits,
				]
					.filter(Boolean)
					.some((value) =>
						String(value).toLocaleLowerCase().includes(normalizedQuery),
					),
			);

			const requestOffset = pageParam;

			return {
				data: matchedContacts.slice(
					requestOffset,
					requestOffset + requestData.limit,
				),
				meta: {
					total: matchedContacts.length,
					offset: requestOffset,
					limit: requestData.limit,
				},
			};
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage) =>
			lastPage.meta.offset + lastPage.meta.limit < lastPage.meta.total
				? lastPage.meta.offset + lastPage.meta.limit
				: undefined,
	});
}
