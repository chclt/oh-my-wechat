import {
	MiniOutlet,
	useMiniRoute,
	useMiniRouter,
} from "@/components/mini-router";
import { MiniRouteFirstPageContentClassName } from "@/components/mini-router/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatListSuspenseQueryOptions } from "@/lib/fetchers/chat";
import { cn } from "@/lib/utils.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import ChatListItem from "./chat-item";
import useChatList from "./use-chat-list";

export interface ChatListMiniRouteState {
	name: "root";
	data: {
		accountId: string;
	};
}

export default function ChatList() {
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
		<div className={cn("absolute inset-0")}>
			<div
				className={cn("absolute inset-0", MiniRouteFirstPageContentClassName)}
			>
				<ScrollArea
					className={"w-full h-full [&>div>div]:block!"}
					aria-hidden={!isThisMiniRouteOnTop}
					style={{
						pointerEvents: isThisMiniRouteOnTop ? "auto" : "none",
					}}
				>
					<ul>
						{chatList.map((chatListItem) => (
							<ChatListItem key={chatListItem.id} chatListItem={chatListItem} />
						))}
					</ul>
				</ScrollArea>
			</div>

			<MiniOutlet />
		</div>
	);
}
