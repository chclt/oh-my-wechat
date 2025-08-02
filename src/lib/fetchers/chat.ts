import type { UseSuspenseQueryOptions } from "@tanstack/react-query";
import adapter from "../adapter";

export function ChatListSuspenseQueryOptions(
  accountId: string,
): UseSuspenseQueryOptions {
  return {
    queryKey: ["chats", accountId],
    queryFn: () => adapter.getChatList().then((res) => res.data),
  };
}
