import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";

type PaginationQuery = Pick<
	UseInfiniteQueryResult,
	| "hasNextPage"
	| "isFetching"
	| "isError"
	| "isFetchNextPageError"
	| "fetchNextPage"
	| "refetch"
>;

export function useMessageSearchPagination(
	query: PaginationQuery,
	inViewport: boolean,
) {
	const {
		hasNextPage,
		isFetching,
		isError,
		isFetchNextPageError,
		fetchNextPage,
		refetch,
	} = query;
	useEffect(() => {
		if (inViewport && hasNextPage && !isFetching && !isError) {
			void fetchNextPage({ cancelRefetch: false });
		}
	}, [inViewport, hasNextPage, isFetching, isError, fetchNextPage]);

	return () =>
		isFetchNextPageError
			? fetchNextPage({ cancelRefetch: false })
			: refetch({ cancelRefetch: false });
}
