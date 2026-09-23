import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";

export function useMessageListPagination(
	query: UseInfiniteQueryResult,
	ready: boolean,
	startIndex: number | undefined,
	endIndex: number | undefined,
	count: number,
) {
	const {
		isFetching,
		isError,
		hasPreviousPage,
		hasNextPage,
		fetchPreviousPage,
		fetchNextPage,
	} = query;
	useEffect(() => {
		if (!ready || isFetching || isError || !count) return;
		// Use the visible range, not overscan or the extra row retained for keyboard focus.
		if (startIndex !== undefined && startIndex <= 2 && hasPreviousPage) {
			void fetchPreviousPage({ cancelRefetch: false });
		} else if (endIndex !== undefined && endIndex >= count - 3 && hasNextPage) {
			void fetchNextPage({ cancelRefetch: false });
		}
	}, [
		ready,
		isFetching,
		isError,
		hasPreviousPage,
		hasNextPage,
		fetchPreviousPage,
		fetchNextPage,
		startIndex,
		endIndex,
		count,
	]);
}
