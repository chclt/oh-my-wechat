import { useSuspenseQuery } from "@tanstack/react-query";
import {
	MiniOutlet,
	useMiniRoute,
	useMiniRouter,
} from "@/components/mini-router";
import { MiniRouteFirstPageContentClassName } from "@/components/mini-router/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatListSuspenseQueryOptions } from "@/lib/fetchers/chat";
import { cn } from "@/lib/utils.ts";
import { ContentSearch } from "../content-search";
import ChatListItem from "./chat-item";
import useChatList from "./use-chat-list";

export interface ChatListMiniRouteState {
	name: "root";
	data: {
		accountId: string;
	};
}

export default function ChatListWithContentSearch() {
	const {
		data: { accountId },
	} = useMiniRoute() as ChatListMiniRouteState;

	const { states: miniRouterStates } = useMiniRouter();
	const thisMiniRouteState = useMiniRoute();
	const thisMiniRoutePosition = miniRouterStates.findIndex((state) =>
		Object.is(state, thisMiniRouteState),
	);
	const isThisMiniRouteOnTop =
		thisMiniRoutePosition === miniRouterStates.length - 1;

	const { data } = useSuspenseQuery(ChatListSuspenseQueryOptions(accountId));

	const chatList = useChatList(data);
	return (
		<ContentSearch.Provider>
			<ChatListContent
				accountId={accountId}
				chatList={chatList}
				isThisMiniRouteOnTop={isThisMiniRouteOnTop}
			/>
		</ContentSearch.Provider>
	);
}

function ChatListContent({
	accountId,
	chatList,
	isThisMiniRouteOnTop,
}: {
	accountId: string;
	chatList: ReturnType<typeof useChatList>;
	isThisMiniRouteOnTop: boolean;
}) {
	const { isSearchEnabled } = ContentSearch.useContentSearch();

	return (
		<div className={cn("absolute inset-0")}>
			<div
				className={cn("absolute inset-0", MiniRouteFirstPageContentClassName)}
			>
				<div
					className="absolute inset-0 overflow-hidden"
					aria-hidden={!isThisMiniRouteOnTop}
					style={{
						pointerEvents: isThisMiniRouteOnTop ? "auto" : "none",
					}}
				>
					<ContentSearch.Input className="texture border-b border-bd" />

					<section
						className={cn(
							"absolute inset-0 transition duration-200 ease-out",
							isSearchEnabled
								? "-translate-x-[min(100%,20rem)] opacity-0"
								: "translate-x-0 opacity-100",
						)}
						aria-hidden={isSearchEnabled || !isThisMiniRouteOnTop}
						style={{
							pointerEvents:
								isSearchEnabled || !isThisMiniRouteOnTop ? "none" : "auto",
						}}
					>
						<ScrollArea
							className="size-full"
							classNames={{ content: "pt-16", scrollBar: "top-16! z-10" }}
						>
							<ul>
								{chatList.map((chatListItem) => (
									<ChatListItem
										key={chatListItem.id}
										chatListItem={chatListItem}
									/>
								))}
							</ul>
						</ScrollArea>
					</section>

					<section
						role="region"
						aria-label="搜索结果"
						className={cn(
							"absolute inset-0 transition duration-200 ease-out",
							isSearchEnabled
								? "translate-x-0 opacity-100"
								: "translate-x-[min(100%,20rem)] opacity-0",
						)}
						aria-hidden={!isSearchEnabled || !isThisMiniRouteOnTop}
						style={{
							pointerEvents:
								isSearchEnabled && isThisMiniRouteOnTop ? "auto" : "none",
						}}
					>
						<ScrollArea
							className="size-full"
							classNames={{ content: "pt-16", scrollBar: "top-16! z-10" }}
						>
							<ContentSearch.ResultPanel
								accountId={accountId}
								classNames={{
									searchGroupTitle: "top-16",
								}}
							/>
						</ScrollArea>
					</section>
				</div>
			</div>

			<MiniOutlet />
		</div>
	);
}
