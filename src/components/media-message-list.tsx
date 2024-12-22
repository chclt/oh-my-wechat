import Message from "@/components/message/message.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import useQuery from "@/lib/hooks/useQuery.ts";
import {
  type Chat,
  type ControllerPaginatorResult,
  type ImageMessage as ImageMessageVM,
  MessageType,
  type Message as MessageVM,
} from "@/lib/schema.ts";
import type React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

interface MediaMessageListProps extends React.HTMLAttributes<HTMLTableElement> {
  chat: Chat;
  isChatroom: boolean;
}

export default function MediaMessageList({
  chat,
  isChatroom,
  className,
  ...props
}: MediaMessageListProps) {
  const { setIsOpenMediaViewer } = useApp();

  const [messageList, setMessageList] = useState<{
    [key: number]: MessageVM[];
  }>({});
  const [query, isQuerying, result, error] = useQuery<
    ControllerPaginatorResult<MessageVM[]>
  >({
    data: [],
    meta: {},
  });

  const paginatorCursor = useRef<number>();

  useEffect(() => {
    paginatorCursor.current = Date.now();
    setMessageList({});
    query("/messages", {
      chat,
      type: [MessageType.IMAGE, MessageType.VIDEO, MessageType.MICROVIDEO],
      cursor: paginatorCursor.current,
    });
  }, [chat]);

  useEffect(() => {
    paginatorCursor.current = result.meta.next_cursor;
    if (result.meta.cursor) {
      setMessageList((old) => ({
        // @ts-ignore TODO
        [result.meta.cursor]: result.data,
        ...old,
      }));
    }
  }, [result]);

  return (
    <div className={"flex gap-px flex-wrap [&>*]:basis-20 [&>*]:grow"}>
      {Object.keys(messageList)
        .map(Number)
        .sort((a, b) => b - a)
        .flatMap((key) => messageList[key])
        .map((message) => (
          <div key={`${message.id}|${message.local_id}`}>
            <Message
              {...props}
              type={message.type}
              // @ts-ignore
              variant="viewer_thumb"
              message={message as ImageMessageVM}
              direction={message.direction}
              showPhoto={true}
              showUsername={true}
              className={
                "relative w-full pb-[100%] [&_img]:absolute [&_img]:inset-0 [&_img]:size-full [&_img]:object-cover"
              }
              onClick={() => {
                // setIsOpenMediaViewer(true)
              }}
            />
          </div>
        ))}

      {Array.from(new Array(8)).map(() => (
        <i />
      ))}
    </div>
  );
}
