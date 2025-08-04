import type { UseSuspenseQueryOptions } from "@tanstack/react-query";
import type { Chat } from "../schema";
import { getDataAdapter } from "../adapter";
import queryClient from "../query-client";

export function ChatListSuspenseQueryOptions(
  accountId: string,
): UseSuspenseQueryOptions<Chat[]> {
  return {
    queryKey: ["chats", accountId],
    queryFn: () =>
      getDataAdapter()
        .getChatList()
        .then((res) => res.data),
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

      const chat = chatList?.find((chat) => chat.id === chatId);

      if (!chat) {
        throw new Error("Chat not found");
      }

      return chat;
    },
  };
}
