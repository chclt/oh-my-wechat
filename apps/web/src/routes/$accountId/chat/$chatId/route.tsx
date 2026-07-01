import { ScrollArea as ScrollAreaBase } from "@base-ui/react";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import React, { Suspense, useEffect, useRef, type UIEventHandler } from "react";
import { ChatUiConfigProvider } from "@/components/chat-ui-config-provider.tsx";
import { LoaderIcon } from "@/components/icon";
import { ScrollAreaScrollBar } from "@/components/ui/scroll-area";
import scrollAreaClasses from "@/components/ui/scroll-area.module.css";
import { ChatSuspenseQueryOptions } from "@/lib/fetchers/chat";
import { MessageListInfiniteQueryOptions } from "@/lib/fetchers/message";
import { UserSuspenseQueryOptions } from "@/lib/fetchers/user";
import router from "@/lib/router";
import { cn, parseOptionalString } from "@/lib/utils";
import { ChatMediaCarousel } from "./-components/chat-media-carousel";
import MessageList from "./-components/message-list";

export interface RouteSearchParams {
	messageLocalId?: string;
}

export const Route = createFileRoute("/$accountId/chat/$chatId")({
	validateSearch: (search): RouteSearchParams => ({
		messageLocalId: parseOptionalString(search.messageLocalId),
	}),
	component: RouteComponent,
	pendingComponent: () => <RoutePlaceholderComponent message="加载中" />,
	errorComponent: () => <RoutePlaceholderComponent />,
	onLeave: () => {
		router.invalidate({
			filter: (route) => route.routeId === Route.id,
		});
	},
});

function RoutePlaceholderComponent({ message }: { message?: string }) {
	const { accountId, chatId } = Route.useParams();

	const { data: user } = useSuspenseQuery(
		UserSuspenseQueryOptions({
			account: { id: accountId },
			user: { id: chatId }, // chatId 的确就是 userId，但这里语义不明
		}),
	);

	return (
		<div className="w-full h-full flex items-center justify-center bg-neutral-100">
			<div className="absolute top-0 w-full h-16 px-6 flex items-center bg-white/80 backdrop-blur">
				<h2 className={"font-medium text-lg"}>
					{user.remark ?? user.username}
				</h2>
			</div>

			{message && <p className="text-sm text-muted-foreground">{message}</p>}
		</div>
	);
}

function RouteComponent() {
	const { accountId, chatId } = Route.useParams();

	const { data: chat } = useSuspenseQuery(
		ChatSuspenseQueryOptions(accountId, chatId),
	);

	const isChatroom = chat.type === "chatroom";

	const messageListInfiniteQueryResult = useInfiniteQuery(
		MessageListInfiniteQueryOptions({
			account: { id: accountId },
			chat: { id: chat.id },
			limit: 20,
		}),
	);

	const {
		data = { pages: [], pageParams: [] },

		hasPreviousPage,
		fetchPreviousPage,
		isFetchingPreviousPage,

		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = messageListInfiniteQueryResult;

	const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (
			data.pageParams.length === 1 &&
			!data.pageParams[0] &&
			scrollAreaViewportRef.current
		) {
			const maxScrollTop =
				scrollAreaViewportRef.current.scrollHeight -
				scrollAreaViewportRef.current.clientHeight;
			scrollAreaViewportRef.current.scrollTop = maxScrollTop;
		}
	}, [data.pageParams]);

	const scrollHeightBeforeUpdate = useRef<number | undefined>(undefined);

	const onScroll: UIEventHandler<HTMLDivElement> = (event) => {
		const target = event.target as HTMLDivElement;
		if (target.scrollTop === 0) {
			scrollHeightBeforeUpdate.current = target.scrollHeight;
			if (hasPreviousPage && !isFetchingPreviousPage) {
				fetchPreviousPage().finally(() => {
					// TODO
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							if (scrollHeightBeforeUpdate.current) {
								const heightDiff =
									target.scrollHeight - scrollHeightBeforeUpdate.current;
								target.scrollTop = heightDiff;
								scrollHeightBeforeUpdate.current = undefined;
							}
						});
					});
				});
			}
		} else if (
			Math.abs(target.scrollTop - target.scrollHeight + target.clientHeight) < 1
		) {
			if (hasNextPage && !isFetchingNextPage) {
				fetchNextPage();
			}
		}
	};

	return (
		<ChatUiConfigProvider
			value={{
				showUsername: isChatroom,
				showPhoto: true,
			}}
		>
			<ChatMediaCarousel.Root account={{ id: accountId }} chat={{ id: chatId }}>
				<Suspense>
					<ScrollAreaBase.Root
						className={cn(
							scrollAreaClasses.Root,
							"contain-strict bg-neutral-100",
							"size-full [&_[data-slot='scroll-area-scrollbar']]:z-50 [&_[data-slot='scroll-area-scrollbar']]:top-16!",
						)}
					>
						<ScrollAreaBase.Viewport
							className={cn(scrollAreaClasses.Viewport)}
							ref={scrollAreaViewportRef}
							onScroll={onScroll}
						>
							<div className="z-20 sticky top-0 w-full h-16 px-6 flex items-center bg-white/80 backdrop-blur">
								<h2 className={"font-medium text-lg"}>{chat.title}</h2>
								{/* <Link
                  to="/$accountId/chat/$chatId/info"
                  params={{
                    accountId: accountId,
                    chatId: chatId,
                  }}
                >
                  Chat Info
                </Link> */}
							</div>
							<div className="mx-auto max-w-3xl p-4 flex flex-col gap-6">
								{hasPreviousPage && (
									<div className="flex justify-center items-center text-neutral-400">
										<LoaderIcon className="animate-spin" />
									</div>
								)}

								<MessageList
									messageListInfiniteQueryResult={
										messageListInfiniteQueryResult
									}
								/>

								{hasNextPage && (
									<div className="flex justify-center items-center text-neutral-400">
										<LoaderIcon className="animate-spin" />
									</div>
								)}
							</div>
						</ScrollAreaBase.Viewport>
						<ScrollAreaScrollBar />
						<ScrollAreaBase.Corner />
					</ScrollAreaBase.Root>
				</Suspense>

				<ChatMediaCarousel.Dialog />
			</ChatMediaCarousel.Root>
		</ChatUiConfigProvider>
	);
}
