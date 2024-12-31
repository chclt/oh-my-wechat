import { MessageBubbleGroup } from "@/components/message-bubble-group.tsx";
import Message from "@/components/message/message.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import useQuery from "@/lib/hooks/useQuery.ts";
import {
  AppMessageType,
  type Chat,
  type ControllerPaginatorResult,
  MessageType,
  type MessageVM,
} from "@/lib/schema.ts";
import { cn } from "@/lib/utils";
import type * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { differenceInMinutes, format, isSameDay } from "date-fns";
import React, { useCallback, useEffect, useRef } from "react";
import { useState } from "react";

interface MessageListProps extends React.HTMLAttributes<HTMLTableElement> {
  chat: Chat;
  isChatroom: boolean;
}

export default function MessageList({
  chat,
  isChatroom,
  className,
  ...props
}: MessageListProps) {
  const [messageList, setMessageList] = useState<{
    [key: number]: MessageVM[];
  }>({});
  const [query, isQuerying, result, error] = useQuery<
    ControllerPaginatorResult<MessageVM[]>
  >({
    data: [],
    meta: {},
  });

  // const paginatorCursor = useRef<number>();

  useEffect(() => {
    setMessageList({});
    query("/messages", {
      chat,
    });
  }, [chat]);

  useEffect(() => {
    // paginatorCursor.current = result.meta.next_cursor;
    if (result.meta.cursor !== undefined) {
      setMessageList((old) => ({
        [result.meta.cursor as number]: result.data,
        ...old,
      }));
    }
  }, [result]);

  // const messageListFlat = Object.values(messageList).
  //   .map(Number)
  //   .sort((a, b) => b - a)
  //   .flatMap((key) => messageList[key]);

  const [scrollRef, setScrollRef] =
    useState<React.ElementRef<typeof ScrollAreaPrimitive.Viewport>>();

  const scrollHeightBeforeUpdate = useRef<number>();

  const onScroll = useCallback(
    (event: Event) => {
      const target = event.target as HTMLDivElement;

      if (Object.keys(messageList).length === 0) return;

      if (target.scrollTop === 0) {
        scrollHeightBeforeUpdate.current = target.scrollHeight;

        query("/messages", {
          chat,
          cursor:
            messageList[Math.min(...Object.keys(messageList).map(Number))][0]
              .date,
          cursor_condition: "<",
        }).finally(() => {
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
    },
    [chat, messageList, query],
  );

  useEffect(() => {
    if (scrollRef) {
      scrollRef.addEventListener("scroll", onScroll);
    }
    return () => {
      if (scrollRef) scrollRef.removeEventListener("scroll", onScroll);
    };
  }, [scrollRef, onScroll]);

  return (
    <ScrollArea
      setScrollRef={setScrollRef}
      className={cn(
        "relative overflow-auto contain-strict bg-neutral-100",
        "[&_[data-orientation]]:z-50",
        className,
      )}
    >
      <div className="z-20 sticky top-0 mb-4 w-full h-[4.5rem] px-4 flex items-center bg-white/80 backdrop-blur">
        <h2 className={"font-medium text-lg"}>{chat.title}</h2>
      </div>

      <div className={"mx-auto max-w-screen-md p-4 flex flex-col gap-6"}>
        {/*
        <Button
          variant="outline"
          onClick={() => {
            query("/messages", {
              chat,
              cursor:
                messageList[
                  Math.min(...Object.keys(messageList).map(Number))
                ][0].date,
              cursor_condition: "<",
            });
          }}
        >
          prev
        </Button>
        */}

        {Object.keys(messageList)
          .map(Number)
          .sort((a, b) => a - b)
          .flatMap((key) => messageList[key])
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

              const isMessageGroupable = (message: MessageVM) => {
                if (message.type === MessageType.APP) {
                  return ![
                    AppMessageType.PAT,
                    AppMessageType.RINGTONE,
                  ].includes(message.message_entity.msg.appmsg.type as number);
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
                  <span>
                    {format(
                      new Date(firstMessage.date * 1000),
                      "yyyy/MM/dd HH:mm",
                    )}
                  </span>
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
                          showPhoto={true}
                          showUsername={isChatroom}
                        />
                      ) : (
                        <Message message={messagesGroupByUser} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })}

        {/*
        <Button
          variant="outline"
          onClick={() => {
            query("/messages", {
              chat,
              cursor:
                messageList[Math.max(...Object.keys(messageList).map(Number))][
                  messageList[Math.max(...Object.keys(messageList).map(Number))]
                    .length - 1
                ].date,
              cursor_condition: ">",
            });
          }}
        >
          next
        </Button>
        */}
      </div>
    </ScrollArea>
  );
}
