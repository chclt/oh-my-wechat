import type { UseSuspenseQueryOptions } from "@tanstack/react-query";
import dataClient from "../adapter";
import { Chat } from "../schema";
import queryClient from "../query-client";

export function ChatListSuspenseQueryOptions(
  accountId: string,
): UseSuspenseQueryOptions<Chat[]> {
  return {
    queryKey: ["chats", accountId],
    queryFn: () => dataClient.adapter.getChatList().then((res) => res.data),
  };
}

export function ChatSuspenseQueryOptions(
  accountId: string,
  chatId: string,
): UseSuspenseQueryOptions<Chat> {
  return {
    queryKey: ["chat", accountId, chatId],
    queryFn: () => {
      const chatList = queryClient.getQueryData<Chat[]>(
        ChatListSuspenseQueryOptions(accountId).queryKey,
      );

      return chatList?.find((chat) => chat.id === chatId) ?? null;
    },
  };
}
