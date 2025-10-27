import {
	MiniOutlet,
	useMiniRoute,
	useMiniRouter,
} from "@/components/mini-router";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatListSuspenseQueryOptions } from "@/lib/fetchers/chat";
import { cn } from "@/lib/utils.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChatGroupListMiniRouteState } from "./chat-group-list";
import ChatItem from "./chat-item";
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

	const { states: miniRouterStates, pushState: pushMiniRouterState } =
		useMiniRouter();
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
				className={cn(
					"absolute inset-0",
					"has-[+[data-state=closed]]:translate-x-0 has-[+[data-state=closed]]:ease-in",
					"has-[+[data-state=open]]:-translate-x-40 has-[+[data-state=open]]:ease-out",
					"transition-transform duration-200",
				)}
			>
				<ScrollArea
					className={"w-full h-full [&>div>div]:block!"}
					aria-hidden={!isThisMiniRouteOnTop}
					style={{
						pointerEvents: isThisMiniRouteOnTop ? "auto" : "none",
					}}
				>
					<ul>
						{chatList.map((chat) => (
							<ChatItem
								key={chat.id}
								chat={chat}
								onOpenChatGroup={(chat) => {
									pushMiniRouterState({
										name: "chatGroupList",
										data: { chat },
									} satisfies ChatGroupListMiniRouteState);
								}}
							/>
						))}
					</ul>
				</ScrollArea>
			</div>

			<MiniOutlet />
		</div>
	);
}
