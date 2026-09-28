import type {
	SearchMessagesRequest,
	SearchMessagesResponse,
	GetMessageSearchIndexStatusResponse,
} from "@repo/types/adapter";
import {
	infiniteQueryOptions,
	type UseQueryOptions,
} from "@tanstack/react-query";
import { getDataAdapter } from "../data-adapter.ts";

export function MessageSearchInfiniteQueryOptions(
	requestData: Omit<SearchMessagesRequest, "offset">,
) {
	const searchText = (requestData.searchText ?? "").trim();

	return infiniteQueryOptions({
		queryKey: [
			`account: ${requestData.account.id}`,
			"messageSearchInfinite",
			{
				query: searchText,
				chatId: requestData.chat?.id ?? null,
				userId: requestData.user?.id ?? null,
				limit: requestData.limit,
				startTime: requestData.startTime ?? null,
				endTime: requestData.endTime ?? null,
			},
		],
		queryFn: ({ pageParam }): SearchMessagesResponse =>
			getDataAdapter().searchMessages({
				...requestData,
				searchText,
				offset: pageParam,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => {
			const nextOffset = lastPage.meta.offset + lastPage.meta.limit;
			return nextOffset < lastPage.meta.total ? nextOffset : undefined;
		},
		enabled: searchText.length > 0,
	});
}

export function SearchIndexStatusQueryOptions(
	accountId: string,
): UseQueryOptions<Awaited<GetMessageSearchIndexStatusResponse>> {
	return {
		queryKey: [`account: ${accountId}`, "messageSearchIndexStatus"],
		// Resource status can change on reload even though the backup and search results are static.
		staleTime: 0,
		gcTime: 0,
		refetchOnMount: "always",
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
