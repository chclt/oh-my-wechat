import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { Suspense, useRef } from "react";
import { ChatUiConfigProvider } from "@/components/chat-ui-config-provider.tsx";
import { ChatSuspenseQueryOptions } from "@/lib/fetchers/chat";
import { UserSuspenseQueryOptions } from "@/lib/fetchers/user";
import router from "@/lib/router";
import {
	getMessageTarget,
	parseMessageTargetSearch,
} from "../-lib/message-target";
import { ChatMediaCarousel } from "./-components/chat-media-carousel";
import type { MessageScrollOrigin } from "./-components/message-list-scroll";
import MessageListView from "./-components/message-list-view";
import { useMessageListWindow } from "./-components/use-message-list-window";

export const Route = createFileRoute("/$accountId/chat/$chatId")({
	validateSearch: parseMessageTargetSearch,
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
	const target = getMessageTarget(Route.useSearch());
	const positionRequestId = useRouterState({
		select: (state) => state.location.state.messagePositionRequestId,
	});

	const { data: chat } = useSuspenseQuery(
		ChatSuspenseQueryOptions(accountId, chatId),
	);

	const isChatroom = chat.type === "chatroom";

	const { queryOptions, windowKey } = useMessageListWindow(
		accountId,
		chatId,
		target,
	);

	const scrollOriginRef = useRef<MessageScrollOrigin | null>(null);
	return (
		<ChatUiConfigProvider
			value={{
				showUsername: isChatroom,
				showPhoto: true,
			}}
		>
			<ChatMediaCarousel.Root account={{ id: accountId }} chat={{ id: chatId }}>
				<Suspense>
					<div className="relative size-full contain-strict bg-neutral-100">
						<div className="absolute inset-x-0 top-0 z-20 h-16 px-6 flex items-center bg-white/80 backdrop-blur">
							<h2 className="min-w-0 truncate font-medium text-lg">
								{chat.title}
							</h2>
						</div>
						<MessageListView
							key={JSON.stringify([accountId, chatId])}
							windowKey={windowKey}
							queryOptions={queryOptions}
							target={target}
							positionRequestId={positionRequestId}
							scrollOriginRef={scrollOriginRef}
						/>
					</div>
				</Suspense>

				<ChatMediaCarousel.Dialog />
			</ChatMediaCarousel.Root>
		</ChatUiConfigProvider>
	);
}
