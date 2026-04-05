import {
	OpenMessageTypeEnum,
	MessageTypeEnum,
	type MessageType,
} from "@repo/types";
import { DataAdapterCursorPagination } from "@repo/types/adapter";
import {
	InfiniteData,
	UseInfiniteQueryResult,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { differenceInMinutes, format, isSameDay } from "date-fns";
import React, { HTMLAttributes } from "react";
import { MessageBubbleGroup } from "@/components/message-bubble-group";
import Message from "@/components/message/message";
import { ChatSuspenseQueryOptions } from "@/lib/fetchers/chat";
import { Route } from "../route";
import { useChatMediaCarouselContext } from "./chat-media-carousel/chat-media-carousel-context";

interface MessageListProps extends HTMLAttributes<HTMLDivElement> {
	messageListInfiniteQueryResult: UseInfiniteQueryResult<
		InfiniteData<DataAdapterCursorPagination<MessageType[]>, unknown>,
		Error
	>;
}

export default function MessageList({
	messageListInfiniteQueryResult,
}: MessageListProps) {
	const { accountId, chatId } = Route.useParams();

	const { data: chat } = useSuspenseQuery(
		ChatSuspenseQueryOptions(accountId, chatId),
	);

	const isChatroom = chat.type === "chatroom";

	const { data = { pages: [], pageParams: [] } } =
		messageListInfiniteQueryResult;

	const { openChatMediaCarousel } = useChatMediaCarouselContext();

	return (
		<>
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
								].includes(message.message_entity.msg.appmsg.type as number);
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
					const firstMessage = isMessageGroup ? firstElement[0] : firstElement;

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

							{messagesGroupByTime.map((messagesGroupByUser, groupIndex) => {
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
											/>
										) : (
											<Message
												message={messagesGroupByUser}
												variant="default"
											/>
										)}
									</React.Fragment>
								);
							})}
						</div>
					);
				})}
		</>
	);
}
