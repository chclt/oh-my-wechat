import { DataAdapterCursorPagination } from "@/adapters/adapter.ts";
import * as MessageController from "@/adapters/ios-backup/controllers/message";
import { type MessageType, VerityMessageType } from "@/schema";
import type {
	DefaultError,
	InfiniteData,
	QueryKey,
	UndefinedInitialDataInfiniteOptions,
	UseQueryOptions,
} from "@tanstack/react-query";
import { getDataAdapter } from "../data-adapter.ts";

export function MessageListInfiniteQueryOptions(
	accountId: string,
	requestData: MessageController.AllInput[0],
): UndefinedInitialDataInfiniteOptions<
	DataAdapterCursorPagination<MessageType[]>,
	DefaultError,
	InfiniteData<DataAdapterCursorPagination<MessageType[]>>,
	QueryKey,
	string | undefined
> {
	return {
		queryKey: ["messages", accountId, requestData.chat.id, requestData.limit],
		queryFn: ({ pageParam }) =>
			getDataAdapter().getMessageList({
				...requestData,
				cursor: pageParam,
			}),
		initialPageParam: undefined,
		getPreviousPageParam: (lastPage) => lastPage.meta.previous_cursor,
		getNextPageParam: (lastPage) => lastPage.meta.next_cursor,
	};
}

export function LastMessageQueryOptions(
	accountId: string,
	requestData: Omit<MessageController.AllInput[0], "limit">,
): UseQueryOptions<MessageType | null> {
	return {
		queryKey: ["lastMessage", accountId, requestData.chat.id],
		queryFn: () =>
			getDataAdapter()
				.getMessageList({ ...requestData, limit: 1 })
				.then((res) => res.data[0] ?? null),
	};
}

export function GreetingMessageListQueryOptions(
	accountId: string,
): UseQueryOptions<VerityMessageType[]> {
	return {
		queryKey: ["greetingMessageList", accountId],
		queryFn: () =>
			getDataAdapter()
				.getGreetingMessageList({ accountId })
				.then((res) => res.data),
	};
}
