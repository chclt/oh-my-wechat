import type {
	SearchChatsRequest,
	SearchChatsResponse,
} from "@repo/types/adapter";
import { infiniteQueryOptions } from "@tanstack/react-query";
import { getDataAdapter } from "../data-adapter.ts";

export function SearchChatsInfiniteQueryOptions(
	requestData: Omit<SearchChatsRequest, "offset">,
) {
	const query = requestData.query.trim();

	return infiniteQueryOptions({
		queryKey: [
			`account: ${requestData.account.id}`,
			"chatSearchInfinite",
			{ query, limit: requestData.limit },
		],
		queryFn: ({ pageParam }): SearchChatsResponse =>
			getDataAdapter().searchChats({
				...requestData,
				query,
				offset: pageParam,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => {
			const nextOffset = lastPage.meta.offset + lastPage.meta.limit;
			return nextOffset < lastPage.meta.total ? nextOffset : undefined;
		},
		enabled: query.length > 0,
	});
}
