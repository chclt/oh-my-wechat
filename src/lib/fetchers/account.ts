import type { UseSuspenseQueryOptions } from "@tanstack/react-query";
import { getDataAdapter } from "../adapter";
import type { User } from "../schema";

export function AccountListSuspenseQueryOptions(): UseSuspenseQueryOptions<
  User[]
> {
  return {
    queryKey: ["accountList"],
    queryFn: () =>
      getDataAdapter()
        .getAccountList()
        .then((res) => res.data),
  };
}
