import type { ContactType } from "@repo/types";
import type { GetAccountContactListRequest } from "@repo/types/adapter";
import type {
	UseQueryOptions,
	UseSuspenseQueryOptions,
} from "@tanstack/react-query";
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
