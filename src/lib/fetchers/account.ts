import type { UseSuspenseQueryOptions } from "@tanstack/react-query";
import { getDataAdapter } from "../adapter";
import type { Account, User } from "../schema";

export function AccountSuspenseQueryOptions(
  accountId: string,
): UseSuspenseQueryOptions<Account> {
  return {
    queryKey: ["account", accountId],
    queryFn: () =>
      getDataAdapter()
        .getAccount(accountId)
        .then((res) => res.data),
  };
}

export function AccountListSuspenseQueryOptions(): UseSuspenseQueryOptions<
  Account[]
> {
  return {
    queryKey: ["accountList"],
    queryFn: () =>
      getDataAdapter()
        .getAccountList()
        .then((res) => res.data),
  };
}
