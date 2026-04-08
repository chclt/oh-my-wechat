import { ContactType } from "@repo/types";
import { GetAccountContactListRequest } from "@repo/types/adapter";
import { UseSuspenseQueryOptions } from "@tanstack/react-query";
import { getDataAdapter } from "../data-adapter";

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
