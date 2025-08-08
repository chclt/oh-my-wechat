import type { UseSuspenseQueryOptions } from "@tanstack/react-query";
import type { ChatType } from "@/schema";
import { getDataAdapter } from "../data-adapter.ts";
import queryClient from "../query-client";

export function ChatListSuspenseQueryOptions(
	accountId: string,
): UseSuspenseQueryOptions<ChatType[]> {
	return {
		queryKey: ["chats", accountId],
		queryFn: () =>
			getDataAdapter()
				.getChatList({})
				.then((res) => res.data)
				.catch((e) => {
					throw e;
				}),
	};
}

export function ChatSuspenseQueryOptions(
	accountId: string,
	chatId: string,
): UseSuspenseQueryOptions<ChatType> {
	return {
		queryKey: ["chat", accountId, chatId],
		queryFn: () => {
			const chatList = queryClient.getQueryData<ChatType[]>(
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
