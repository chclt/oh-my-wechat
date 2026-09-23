import type { SearchMessagesResponse } from "@repo/types/adapter";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { MessageSearchDetailsQueryOptions } from "@/lib/fetchers/message-search.ts";

export function useMessageResultDetails(
	accountId: string,
	messages: Awaited<SearchMessagesResponse>["data"],
) {
	const [{ data: chats }, { data: users }] = useSuspenseQueries({
		queries: MessageSearchDetailsQueryOptions(accountId, messages),
	});
	return {
		chatsById: useMemo(
			() => new Map(chats.map((chat) => [chat.id, chat])),
			[chats],
		),
		usersById: useMemo(
			() => new Map(users.map((user) => [user.id, user])),
			[users],
		),
	};
}
