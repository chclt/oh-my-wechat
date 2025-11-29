import {
	DataAdapterCursorPagination,
	GetGreetingMessageListRequest,
	GetMessageListRequest,
} from "@/adapters/adapter.ts";
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
	requestData: GetMessageListRequest,
): UndefinedInitialDataInfiniteOptions<
	DataAdapterCursorPagination<MessageType[]>,
	DefaultError,
	InfiniteData<DataAdapterCursorPagination<MessageType[]>>,
	QueryKey,
	string | undefined
> {
	return {
		queryKey: [
			`account: ${requestData.account.id}`,
			`chat: ${requestData.chat.id}`,
			`messageList:${requestData.limit}`,
		],
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
	requestData: Omit<GetMessageListRequest, "limit">,
): UseQueryOptions<MessageType | null> {
	return {
		queryKey: [
			`account: ${requestData.account.id}`,
			`chat: ${requestData.chat.id}`,
			"lastMessage",
		],
		queryFn: () =>
			getDataAdapter()
				.getMessageList({ ...requestData, limit: 1 })
				.then((res) => res.data[0] ?? null),
	};
}

export function GreetingMessageListQueryOptions(
	requestData: GetGreetingMessageListRequest,
): UseQueryOptions<VerityMessageType[]> {
	return {
		queryKey: [`account: ${requestData.account.id}`, "greetingMessageList"],
		queryFn: () =>
			getDataAdapter()
				.getGreetingMessageList(requestData)
				.then((res) => res.data),
	};
}
