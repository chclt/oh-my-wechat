import { Button } from "@base-ui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LoaderIcon } from "@/components/icon";
import { SearchChatsInfiniteQueryOptions } from "@/lib/fetchers/chat-search.ts";
import { cn } from "@/lib/utils";
import { ChatResultItem } from "./chat-result-item.tsx";

export function ChatSearchResults({
	accountId,
	query,
	titleClassName,
}: {
	accountId: string;
	query: string;
	titleClassName?: string;
}) {
	const results = useInfiniteQuery(
		SearchChatsInfiniteQueryOptions({
			account: { id: accountId },
			query,
			limit: 5,
		}),
	);
	const chats = results.data?.pages.flatMap((page) => page.data) ?? [];

	return (
		<div>
			<div
				className={cn(
					"sticky z-10 top-0 h-11 ps-5 flex items-center texture",
					titleClassName,
				)}
			>
				<div className="h-full w-full min-w-0 ps-0.5 pe-5 flex items-center gap-2 border-b border-muted text-sm text-muted-foreground">
					聊天
				</div>
			</div>
			{results.isLoading ? (
				<div className="relative h-17 flex items-center justify-center text-muted-foreground after:absolute after:start-5 after:end-0 after:bottom-0 after:border-b after:border-muted">
					<LoaderIcon className="size-5 animate-spin" />
				</div>
			) : results.isError ? (
				<div
					role="alert"
					className="relative h-17 px-5 flex items-center text-sm text-muted-foreground after:absolute after:start-5 after:end-0 after:bottom-0 after:border-b after:border-muted"
				>
					搜索失败
				</div>
			) : chats.length > 0 ? (
				<ul>
					{chats.map((chat) => (
						<ChatResultItem key={chat.id} accountId={accountId} chat={chat} />
					))}
				</ul>
			) : (
				<div className="relative h-17 px-5 flex items-center text-sm text-muted-foreground after:absolute after:start-5 after:end-0 after:bottom-0 after:border-b after:border-muted">
					没有聊天结果
				</div>
			)}
			{results.hasNextPage && !results.isError && (
				<Button
					className="w-full h-17 ps-5 hover:bg-muted"
					disabled={results.isFetching}
					onClick={() => results.fetchNextPage({ cancelRefetch: false })}
				>
					<div className="h-full w-full min-w-0 ps-0.5 pe-5 flex items-center gap-2 border-b border-muted text-sm text-muted-foreground">
						加载更多聊天搜索结果
					</div>
				</Button>
			)}
		</div>
	);
}
