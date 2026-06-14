import type {
	SearchMessagesRequest,
	SearchMessagesResponse,
	GetMessageSearchIndexStatusResponse,
} from "@repo/types/adapter";
import type {
	DefaultError,
	InfiniteData,
	QueryKey,
	UndefinedInitialDataInfiniteOptions,
	UseQueryOptions,
} from "@tanstack/react-query";
import { getDataAdapter } from "../data-adapter.ts";

export function MessageSearchInfiniteQueryOptions(
	requestData: Omit<SearchMessagesRequest, "offset">,
): UndefinedInitialDataInfiniteOptions<
	Awaited<SearchMessagesResponse>,
	DefaultError,
	InfiniteData<Awaited<SearchMessagesResponse>>,
	QueryKey,
	number
> {
	const hasSearchText = (requestData.searchText ?? "").trim().length > 0;

	return {
		queryKey: [
			`account: ${requestData.account.id}`,
			"messageSearchInfinite",
			{
				query: requestData.searchText ?? "",
				chatId: requestData.chat?.id ?? null,
				userId: requestData.user ?? null,
				limit: requestData.limit,
				startTime: requestData.startTime ?? null,
				endTime: requestData.endTime ?? null,
			},
		],
		queryFn: ({ pageParam }) =>
			getDataAdapter().searchMessages({
				...requestData,
				offset: pageParam,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => {
			const nextOffset = lastPage.meta.offset + lastPage.meta.limit;
			return nextOffset < lastPage.meta.total ? nextOffset : undefined;
		},
		enabled: hasSearchText,
	};
}

export function SearchIndexStatusQueryOptions(
	accountId: string,
): UseQueryOptions<Awaited<GetMessageSearchIndexStatusResponse>> {
	return {
		queryKey: [`account: ${accountId}`, "messageSearchIndexStatus"],
		queryFn: () =>
			getDataAdapter().getMessageSearchIndexStatus({
				account: { id: accountId },
			}),
		refetchInterval: (query) => {
			const currentStatus = query.state.data;
			if (
				currentStatus &&
				(currentStatus.phase === "ready" || currentStatus.phase === "failed")
			) {
				return false;
			}
			return 500;
		},
	};
}
