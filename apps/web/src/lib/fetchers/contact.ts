import { UseSuspenseQueryOptions } from "@tanstack/react-query";
import { getDataAdapter } from "../data-adapter";
import { ContactType } from "@/schema";

export function AccountContactListSuspenseQueryOptions(
	accountId: string,
): UseSuspenseQueryOptions<ContactType[]> {
	return {
		queryKey: [`account: ${accountId}`, "ContactList"],
		queryFn: () =>
			getDataAdapter()
				.getAccountContactList({
					accountId,
				})
				.then((res) => res.data),
	};
}
