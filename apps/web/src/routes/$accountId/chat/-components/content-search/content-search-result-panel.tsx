import { Button } from "@base-ui/react";
import { useDebouncedValue, useInViewport } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import type React from "react";
import { LoaderIcon } from "@/components/icon";
import { SearchAccountContactInfiniteQueryOptions } from "@/lib/fetchers/contact";
import { MessageSearchInfiniteQueryOptions } from "@/lib/fetchers/message-search";
import { cn } from "@/lib/utils";
import { MessageResultPage } from "@/routes/$accountId/chat/-components/content-search/message-result-page.tsx";
import { MessageResultTitle } from "@/routes/$accountId/chat/-components/content-search/message-result-title.tsx";
import { ContactResultItem } from "./contact-result-item";
import { useContentSearch } from "./content-search-provider";

const CONTACT_RESULT_PAGE_SIZE = 5;
const MESSAGE_RESULT_PAGE_SIZE = 20;

interface ChatSearchResultsProps {
	accountId: string;

	classNames?: {
		searchGroupTitle?: string;
	};
}

export function ContentSearchResultPanel({
	accountId,

	classNames,
}: ChatSearchResultsProps) {
	const {
		searchQuery,
		searchFromChat,
		setSearchFromChat,
		searchFromUser,
		setSearchFromUser,
		searchStartTime,
		searchEndTime,
	} = useContentSearch();
	const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);
	const normalizedQuery = debouncedSearchQuery.trim();

	const contactSearchQueryResult = useInfiniteQuery(
		SearchAccountContactInfiniteQueryOptions({
			account: { id: accountId },
			query: normalizedQuery,
			limit: CONTACT_RESULT_PAGE_SIZE,
		}),
	);

	const contactSearchResult = (
		contactSearchQueryResult.data ?? { pages: [], pageParams: [] }
	).pages.flatMap((page) => page.data);

	const { ref: messageLoadMoreRef, inViewport: isMessageLoadMoreInViewport } =
		useInViewport();

	const messageSearchQueryResult = useInfiniteQuery(
		MessageSearchInfiniteQueryOptions({
			account: { id: accountId },
			searchText: normalizedQuery,
			chat: searchFromChat ? { id: searchFromChat } : undefined,
			user: searchFromUser ? { id: searchFromUser } : undefined,
			startTime: searchStartTime || undefined,
			endTime: searchEndTime || undefined,
			limit: MESSAGE_RESULT_PAGE_SIZE,
		}),
	);
	useEffect(() => {
		if (
			isMessageLoadMoreInViewport &&
			messageSearchQueryResult.hasNextPage &&
			!messageSearchQueryResult.isFetchingNextPage
		) {
			void messageSearchQueryResult.fetchNextPage();
		}
	}, [
		isMessageLoadMoreInViewport,
		messageSearchQueryResult.hasNextPage,
		messageSearchQueryResult.isFetchingNextPage,
		messageSearchQueryResult.fetchNextPage,
	]);

	if (normalizedQuery.length === 0) {
		return null;
	}

	return (
		<div className="">
			<div>
				<div
					className={cn(
						"sticky z-10 top-0 h-11 ps-5 flex items-center texture",
						classNames?.searchGroupTitle,
					)}
				>
					<div className="h-full w-full min-w-0 ps-0.5 pe-5 flex items-center gap-2 border-b border-muted text-sm text-muted-foreground">
						联系人
					</div>
				</div>

				{contactSearchQueryResult.isLoading ? (
					<div className="h-16 flex items-center justify-center text-muted-foreground">
						<LoaderIcon className="size-5 animate-spin" />
					</div>
				) : contactSearchResult.length > 0 ? (
					<ul>
						{contactSearchResult.map((contactItem) => (
							<ContactResultItem
								key={contactItem.id}
								accountId={accountId}
								contactItem={contactItem}
							/>
						))}
					</ul>
				) : (
					<div className="px-5 py-4 text-sm text-muted-foreground">
						没有联系人结果
					</div>
				)}

				{contactSearchQueryResult.hasNextPage && (
					<Button
						className="w-full h-11 ps-5 hover:bg-muted"
						disabled={contactSearchQueryResult.isFetchingNextPage}
						onClick={() => contactSearchQueryResult.fetchNextPage()}
					>
						<div className="h-full w-full min-w-0 ps-0.5 pe-5 flex items-center gap-2 border-b border-muted text-sm text-muted-foreground">
							加载更多联系人搜索结果
						</div>
					</Button>
				)}
			</div>

			<div>
				<MessageResultTitle className={classNames?.searchGroupTitle} />
				{messageSearchQueryResult.isLoading ? (
					<div className="h-16 flex items-center justify-center text-muted-foreground">
						<LoaderIcon className="size-5 animate-spin" />
					</div>
				) : (
					<ul>
						{(
							messageSearchQueryResult.data ?? { pages: [], pageParams: [] }
						).pages.map((page) => (
							<Suspense key={JSON.stringify(page.meta)}>
								<MessageResultPage data={page.data} query={normalizedQuery} />
							</Suspense>
						))}
					</ul>
				)}

				{messageSearchQueryResult.hasNextPage && (
					<div
						ref={messageLoadMoreRef}
						className="h-17 flex items-center justify-center text-muted-foreground"
					>
						<LoaderIcon className="size-5 animate-spin" />
					</div>
				)}
			</div>
		</div>
	);
}
