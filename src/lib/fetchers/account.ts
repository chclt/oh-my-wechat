import { UseSuspenseQueryOptions } from "@tanstack/react-query";
import dataClient from "../adapter";
import { User } from "../schema";

export function AccountListSuspenseQueryOptions(): UseSuspenseQueryOptions<
  User[]
> {
  return {
    queryKey: ["accountList"],
    queryFn: () => dataClient.adapter.getAccountList().then((res) => res.data),
  };
}
