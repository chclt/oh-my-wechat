import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { MessageListInfiniteQueryOptions } from "@/lib/fetchers/message";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Calendar } from "@/components/ui/calendar";
import { ChatSuspenseQueryOptions } from "@/lib/fetchers/chat";
import { AppMessageType, MessageType, type MessageVM } from "@/lib/schema";
import { differenceInMinutes, format, isSameDay } from "date-fns";
import { MessageBubbleGroup } from "@/components/message-bubble-group";
import Message from "@/components/message/message";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "@/components/icon";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/$accountId/chat/$chatId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { accountId, chatId } = Route.useParams();

	const { data: chat } = useSuspenseQuery(
		ChatSuspenseQueryOptions(accountId, chatId),
	);

	const isChatroom = chat.type === "chatroom";

	// const [messageList, setMessageList] = useState<{
	//   [key: number]: MessageVM[];
	// }>({});
	// const [query, isQuerying, result, error] = useQuery<
	//   ControllerPaginatorResult<MessageVM[]>
	// >({
	//   data: [],
	//   meta: {},
	// });

	// const paginatorCursor = useRef<number>();

	// useEffect(() => {
	//   setMessageList({});
	//   query("/messages", {
	//     chat,
	//   });
	// }, [chat]);

	// const { accountId, chatId } = Route.useParams();

	// const {data: account} = useSuspenseQuery(AccountSuspenseQueryOptions)
	// const {data: chat} = useSuspenseQuery(ChatSuspenseQueryOptions)

	const {
		data = { pages: [], pageParams: [] },

		hasPreviousPage,
		fetchPreviousPage,
		isFetchingPreviousPage,

		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery(
		MessageListInfiniteQueryOptions(accountId, {
			chat,
			limit: 20,
		}),
	);

	const scrollHeightBeforeUpdate = useRef<number>();

	const onScroll = (event: Event) => {
		const target = event.target as HTMLDivElement;
		if (target.scrollTop === 0) {
			scrollHeightBeforeUpdate.current = target.scrollHeight;
			if (hasPreviousPage && !isFetchingPreviousPage) {
				fetchPreviousPage().finally(() => {
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

	const [isOpenCalendar, setIsOpenCalendar] = useState(false);
	const [calendarMonth, setCalendarMonth] = useState<Date | undefined>();
	const [selectedDate, setSelectedDate] = useState<Date | undefined>();
	// const onSelectDate = (date: Date | undefined) => {
	//   if (!date) return;
	//   // setMessageList({});
	//   // query("/messages", {
	//   //   chat,
	//   //   cursor: date.getTime() / 1000,
	//   //   cursor_condition: "<>",
	//   // });
	//   // setIsOpenCalendar(false);
	// };

	return (
		<>
			<ScrollAreaPrimitive.Root
				className={cn(
					"relative overflow-hidden contain-strict bg-neutral-100",
					"**:data-orientation:z-50",
					"w-full h-full [&>div>div]:block!",
				)}
			>
				<ScrollAreaPrimitive.Viewport
					className="h-full w-full"
					onScroll={onScroll}
				>
					<div className="z-20 sticky top-0 mb-4 w-full h-18 px-6 flex items-center bg-white/80 backdrop-blur">
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
									const isSameUser =
										user && prevUser && user.id === prevUser.id;

									const isMessageGroupable = (message: MessageVM) => {
										if (message.type === MessageType.APP) {
											return ![
												AppMessageType.PAT,
												AppMessageType.RINGTONE,
											].includes(
												message.message_entity.msg.appmsg.type as number,
											);
										}

										return ![
											MessageType.SYSTEM,
											MessageType.SYSTEM_EXTENDED,
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
								[] as (MessageVM | MessageVM[])[][],
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
												//   setIsOpenCalendar(true);
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
												const isMessageGroup =
													Array.isArray(messagesGroupByUser);
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
				</ScrollAreaPrimitive.Viewport>
				<ScrollBar />
				<ScrollAreaPrimitive.Corner />
			</ScrollAreaPrimitive.Root>

			{/* <Dialog
        open={isOpenCalendar}
        onOpenChange={(open) => {
          setIsOpenCalendar(open);
        }}
      > 
        <DialogContent className={"place-content-center w-fit"}>
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>Select a date</DialogTitle>
              <DialogDescription>
                Select a date to view messages from that day.
              </DialogDescription>
            </DialogHeader>
          </VisuallyHidden>

          <Calendar
            mode="single"
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            selected={selectedDate}
            onSelect={onSelectDate}
          />
        </DialogContent>
      </Dialog> */}
		</>
	);
}
