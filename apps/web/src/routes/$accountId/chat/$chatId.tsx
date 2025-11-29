import { LoaderIcon } from "@/components/icon";
import { MessageBubbleGroup } from "@/components/message-bubble-group";
import Message from "@/components/message/message";
import { ScrollAreaScrollBar } from "@/components/ui/scroll-area";
import scrollAreaClasses from "@/components/ui/scroll-area.module.css";
import { ChatSuspenseQueryOptions } from "@/lib/fetchers/chat";
import { MessageListInfiniteQueryOptions } from "@/lib/fetchers/message";
import { UserSuspenseQueryOptions } from "@/lib/fetchers/user";
import router from "@/lib/router";
import { cn } from "@/lib/utils";
import { MessageTypeEnum, type MessageType } from "@/schema";
import { OpenMessageTypeEnum } from "@/schema/open-message.ts";
import { ScrollArea as ScrollAreaBase } from "@base-ui-components/react";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { differenceInMinutes, format, isSameDay } from "date-fns";
import React, { useEffect, useRef, type UIEventHandler } from "react";

export const Route = createFileRoute("/$accountId/chat/$chatId")({
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

	const {
		data = { pages: [], pageParams: [] },

		hasPreviousPage,
		fetchPreviousPage,
		isFetchingPreviousPage,

		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery(
		MessageListInfiniteQueryOptions({
			account: { id: accountId },
			chat: { id: chat.id },
			limit: 20,
		}),
	);

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
				</div>

				<div className="mx-auto max-w-3xl p-4 flex flex-col gap-6">
					{hasPreviousPage && (
						<div className="flex justify-center items-center text-neutral-400">
							<LoaderIcon className="animate-spin" />
						</div>
					)}

					{data.pages
						.flatMap((pageData) => pageData.data)
						.reduce(
							(messagesGroupByTimeAndUser, message, index, messageArray) => {
								const prevMessage = messageArray[index - 1];

								let anchor: Array<unknown> = messagesGroupByTimeAndUser; // 把消息插入到哪个位置

								const date = new Date(message.date * 1000);
								const prevDate = prevMessage
									? new Date(prevMessage.date * 1000)
									: undefined;

								const isSameDate = prevDate && isSameDay(date, prevDate);
								const timeDiff = prevDate
									? differenceInMinutes(date, prevDate)
									: undefined;

								if (!isSameDate || (timeDiff && timeDiff > 15)) {
									anchor.push([]);
								}

								anchor = anchor[anchor.length - 1] as Array<unknown>;

								const user = message.from;
								const prevUser = prevMessage?.from;
								const isSameUser = user && prevUser && user.id === prevUser.id;

								const isMessageGroupable = (message: MessageType) => {
									if (message.type === MessageTypeEnum.APP) {
										return ![
											OpenMessageTypeEnum.PAT,
											OpenMessageTypeEnum.RINGTONE,
										].includes(
											message.message_entity.msg.appmsg.type as number,
										);
									}

									return ![
										MessageTypeEnum.SYSTEM,
										MessageTypeEnum.SYSTEM_EXTENDED,
									].includes(message.type);
								};

								const isGroupable = isMessageGroupable(message);
								const isPrevGroupable =
									prevMessage && isMessageGroupable(prevMessage);

								if (isSameUser && isPrevGroupable && isGroupable) {
									if (anchor.length > 0) {
										anchor = anchor[anchor.length - 1] as Array<unknown>;
									} else {
										anchor.push([]);
										anchor = anchor[anchor.length - 1] as Array<unknown>;
									}
								} else if (user && isGroupable) {
									anchor.push([]);
									anchor = anchor[anchor.length - 1] as Array<unknown>;
								}

								anchor.push(message);

								return messagesGroupByTimeAndUser;
							},
							[] as (MessageType | MessageType[])[][],
						)
						.map((messagesGroupByTime) => {
							const firstElement = messagesGroupByTime[0];
							const isMessageGroup = Array.isArray(firstElement);
							const firstMessage = isMessageGroup
								? firstElement[0]
								: firstElement;

							return (
								<div
									key={`${chat.id}/time:${new Date(firstMessage.date * 1000).getTime()}`}
									className="space-y-4"
								>
									<div className={"text-center text-sm text-neutral-600"}>
										<button
											type="button"
											// onClick={() => {
											//   setCalendarMonth(new Date(firstMessage.date * 1000));
											//   setSelectedDate(new Date(firstMessage.date * 1000));
											//   setIsOpenCalendar(true)
											// }}
										>
											{format(
												new Date(firstMessage.date * 1000),
												"yyyy/MM/dd HH:mm",
											)}
										</button>
									</div>

									{messagesGroupByTime.map(
										(messagesGroupByUser, groupIndex) => {
											const isMessageGroup = Array.isArray(messagesGroupByUser);
											const firstMessage = isMessageGroup
												? messagesGroupByUser[0]
												: messagesGroupByUser;

											const lastMessage = isMessageGroup
												? messagesGroupByUser[messagesGroupByUser.length - 1]
												: messagesGroupByUser;

											return (
												<React.Fragment
													key={`${chat.id}/(${groupIndex})${firstMessage.id}-${lastMessage.id}`}
												>
													{isMessageGroup ? (
														<MessageBubbleGroup
															user={firstMessage.from}
															messages={messagesGroupByUser}
															showPhoto={true}
															showUsername={isChatroom}
														/>
													) : (
														<Message message={messagesGroupByUser} />
													)}
												</React.Fragment>
											);
										},
									)}
								</div>
							);
						})}

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
	);
}
