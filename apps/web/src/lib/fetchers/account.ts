import type { AccountType } from "@repo/types";
import { GetAccountRequest } from "@repo/types/adapter";
import type { UseSuspenseQueryOptions } from "@tanstack/react-query";
import { getDataAdapter } from "../data-adapter.ts";

export function AccountSuspenseQueryOptions(
	requestData: GetAccountRequest,
): UseSuspenseQueryOptions<AccountType> {
	return {
		queryKey: [`account: ${requestData.account.id}`],
		queryFn: () =>
			getDataAdapter()
				.getAccount(requestData)
				.then((res) => res.data),
	};
}

export function AccountListSuspenseQueryOptions(): UseSuspenseQueryOptions<
	AccountType[]
> {
	return {
		queryKey: ["accountList"],
		queryFn: () =>
			getDataAdapter()
				.getAccountList()
				.then((res) => res.data),
	};
}
