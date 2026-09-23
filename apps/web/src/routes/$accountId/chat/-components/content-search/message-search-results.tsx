import { Button } from "@base-ui/react";
import { useInViewport } from "@mantine/hooks";
import type { SearchMessagesRequest } from "@repo/types/adapter";
import { hashKey, useInfiniteQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoaderIcon } from "@/components/icon";
import { MessageSearchInfiniteQueryOptions } from "@/lib/fetchers/message-search.ts";
import { MessageResultPage } from "./message-result-page.tsx";
import { MessageResultTitle } from "./message-result-title.tsx";
import { useMessageSearchPagination } from "./use-message-search-pagination.ts";

export function MessageSearchResults({
	request,
	titleClassName,
}: {
	request: Omit<SearchMessagesRequest, "offset" | "limit">;
	titleClassName?: string;
}) {
	const options = MessageSearchInfiniteQueryOptions({ ...request, limit: 20 });
	const results = useInfiniteQuery(options);
	const searchKey = hashKey(options.queryKey);
	const { ref, inViewport } = useInViewport();
	const retry = useMessageSearchPagination(results, inViewport);
	return (
		<div>
			<MessageResultTitle
				chatScope={request.chat?.id}
				className={titleClassName}
			/>
			{results.isLoading ? (
				<div className="relative h-17 flex items-center justify-center text-muted-foreground after:absolute after:start-5 after:end-0 after:bottom-0 after:border-b after:border-muted">
					<LoaderIcon className="size-5 animate-spin" />
				</div>
			) : results.data?.pages.some((page) => page.data.length > 0) ? (
				<ul>
					{results.data?.pages.map((page) => (
						<ErrorBoundary
							key={`${searchKey}:${page.meta.offset}`}
							fallback={null}
						>
							<Suspense>
								<MessageResultPage
									accountId={request.account.id}
									data={page.data}
								/>
							</Suspense>
						</ErrorBoundary>
					))}
				</ul>
			) : (
				!results.isError && (
					<div className="relative h-17 px-5 flex items-center text-sm text-muted-foreground after:absolute after:start-5 after:end-0 after:bottom-0 after:border-b after:border-muted">
						没有聊天记录结果
					</div>
				)
			)}
			{results.isError && (
				<div
					role="alert"
					className="relative h-17 px-5 flex items-center gap-2 text-sm text-muted-foreground after:absolute after:start-5 after:end-0 after:bottom-0 after:border-b after:border-muted"
				>
					<span>聊天记录搜索失败</span>
					<Button
						className="underline"
						disabled={results.isFetching}
						onClick={retry}
					>
						重试
					</Button>
				</div>
			)}
			{results.hasNextPage && !results.isError && (
				<div
					ref={ref}
					className="relative h-17 flex items-center justify-center text-muted-foreground after:absolute after:start-5 after:end-0 after:bottom-0 after:border-b after:border-muted"
				>
					<LoaderIcon className="size-5 animate-spin" />
				</div>
			)}
		</div>
	);
}
