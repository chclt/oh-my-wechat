import type { MessageType } from "@repo/types";
import type { DataAdapterCursorPagination } from "@repo/types/adapter";
import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
	MediaListInfiniteQueryOptions,
	type MediaPagesOptions,
} from "./utils";

const EMPTY_MESSAGES: MessageType[] = [];
const selectMessages = (
	data: InfiniteData<DataAdapterCursorPagination<MessageType[]>>,
) => data.pages.flatMap((page) => page.data);

export function useMediaPages(options: MediaPagesOptions) {
	const query = useInfiniteQuery({
		...MediaListInfiniteQueryOptions(options),
		select: selectMessages,
	});
	return { query, messages: query.data ?? EMPTY_MESSAGES };
}

type MediaPages = ReturnType<typeof useMediaPages>;

/**
 * Query results may arrive during a gesture. Stage them until both tracks settle,
 * so inserting items cannot cancel momentum or change the browser's snap target.
 * Fetching can still run during scrolling; only publishing a new layout waits.
 */
export function useMediaPageWindow(pages: MediaPages) {
	const [messages, setMessages] = useState(pages.messages);
	return {
		messages,
		publish: setMessages,
		hasPendingPages: messages !== pages.messages,
	};
}

interface PaginationOptions {
	pages: MediaPages;
	pageWindow: ReturnType<typeof useMediaPageWindow>;
	isReady: boolean;
	isScrolling: boolean;
	firstIndex: number | undefined;
	lastIndex: number | undefined;
}

export function useMediaPagination({
	pages,
	pageWindow,
	isReady,
	isScrolling,
	firstIndex,
	lastIndex,
}: PaginationOptions) {
	const { query, messages: fetchedMessages } = pages;
	const { messages, publish, hasPendingPages } = pageWindow;
	const {
		isFetching,
		isError,
		hasPreviousPage,
		hasNextPage,
		fetchPreviousPage,
		fetchNextPage,
	} = query;
	useEffect(() => {
		if (!isScrolling && hasPendingPages) publish(fetchedMessages);
	}, [isScrolling, hasPendingPages, fetchedMessages, publish]);

	useEffect(() => {
		if (
			!isReady ||
			!messages.length ||
			hasPendingPages ||
			isFetching ||
			isError
		)
			return;
		// InfiniteQuery has one fetch slot. A single branch prevents opposing
		// requests from repeatedly cancelling each other when both edges fit.
		if (firstIndex === 0 && hasPreviousPage) {
			void fetchPreviousPage({ cancelRefetch: false });
		} else if (lastIndex === messages.length - 1 && hasNextPage) {
			void fetchNextPage({ cancelRefetch: false });
		}
	}, [
		isReady,
		messages.length,
		hasPendingPages,
		isFetching,
		isError,
		firstIndex,
		lastIndex,
		hasPreviousPage,
		hasNextPage,
		fetchPreviousPage,
		fetchNextPage,
	]);

	return () => {
		if (isFetching) return;
		if (query.isFetchPreviousPageError)
			void fetchPreviousPage({ cancelRefetch: false });
		else if (query.isFetchNextPageError)
			void fetchNextPage({ cancelRefetch: false });
		else void query.refetch({ cancelRefetch: false });
	};
}
