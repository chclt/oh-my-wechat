import ChatroomMessage from "@/components/message/chatroom-message.tsx";
import Message from "@/components/message/message.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import useQuery from "@/lib/hooks/useQuery.ts";
import type {
  Chat,
  ControllerPaginatorResult,
  Message as MessageVM,
} from "@/lib/schema.ts";
import { cn } from "@/lib/utils";
import type * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import dayjs from "dayjs";
import React, { useEffect } from "react";
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

    if (result.meta.cursor) {
      setMessageList((old) => ({
        // @ts-ignore TODO
        [result.meta.cursor]: result.data,
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

  return (
    <ScrollArea
      setScrollRef={setScrollRef}
      className={cn(
        "relative overflow-auto contain-strict bg-neutral-100",
        className,
      )}
    >
      <div className="z-10 sticky top-0 mb-4 w-full h-[4.5rem] px-4 flex items-center bg-white/80 backdrop-blur">
        <h2 className={"font-medium text-lg"}>{chat.title}</h2>
      </div>

      <div className={"mx-auto max-w-screen-md px-4 flex flex-col gap-2"}>
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

        {Object.keys(messageList)
          .map(Number)
          .sort((a, b) => a - b)
          .flatMap((key) => messageList[key])
          .map((message, index, messageArray) => {
            const prevMessage = messageArray[index - 1];
            const isSameFrom =
              prevMessage &&
              message.from &&
              prevMessage.from &&
              message.from.id === prevMessage.from.id;
            const messageDate = dayjs(message.date * 1000);
            const nextMessageDate = prevMessage
              ? dayjs(prevMessage.date * 1000)
              : dayjs();

            const isSameDate =
              prevMessage && messageDate.isSame(nextMessageDate, "year");

            const timeDiff =
              prevMessage && messageDate.diff(nextMessageDate, "minutes");

            return (
              <React.Fragment key={`${message.id}|${message.local_id}`}>
                {/*isSameFrom: {isSameFrom ? "1" : "0"}*/}

                {(!isSameDate || timeDiff > 15) && (
                  <div className={"mt-4 text-center text-sm text-neutral-600"}>
                    <span>{messageDate.format("YYYY/MM/DD HH:mm")}</span>
                  </div>
                )}

                {isChatroom ? (
                  <ChatroomMessage
                    {...props}
                    key={`${message.id}|${message.local_id}`}
                    type={message.type}
                    message={message}
                    direction={message.direction}
                    showPhoto={true}
                    showUsername={true}
                  />
                ) : (
                  <Message
                    {...props}
                    key={`${message.id}|${message.local_id}`}
                    type={message.type}
                    message={message}
                    direction={message.direction}
                    showPhoto={true}
                    showUsername={false}
                  />
                )}
              </React.Fragment>
            );
          })}

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
      </div>
    </ScrollArea>
  );
}
