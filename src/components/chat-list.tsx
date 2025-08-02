import Image from "@/components/image.tsx";
import Message from "@/components/message/message.tsx";
import {
  ChatListSuspenseQueryOptions,
  MessageListInfiniteQueryOptions,
} from "@/lib/fetchers/chat";
import { useApp } from "@/lib/hooks/appProvider";
import useQuery from "@/lib/hooks/useQuery";
import type { Chat, ControllerResult, MessageVM } from "@/lib/schema.ts";
import { cn, formatDateTime } from "@/lib/utils.ts";
import type { WorkerResponse } from "@/lib/worker.ts";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import type React from "react";
import { forwardRef, useEffect, useRef, useState } from "react";

interface ChatListProps
  extends Omit<React.HTMLAttributes<HTMLLIElement>, "onClick"> {
  onClick: (chat: Chat) => void;
}

export default function ChatList({ onClick, ...props }: ChatListProps) {
  const { user } = useApp();

  const { data, isLoading, error } = useSuspenseQuery(
    ChatListSuspenseQueryOptions(user.id),
  );

  useEffect(() => {
    // query("/chats");
  }, []);

  return (
    <ul>
      {data
        .sort((i) => (i.is_pinned ? -1 : 1))
        .map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            onClick={() => {
              onClick(chat);
            }}
          />
        ))}
    </ul>
  );
}

interface ChatItemProps extends React.HTMLAttributes<HTMLLIElement> {
  chat: Chat;
}

const ChatItem = forwardRef<HTMLLIElement, ChatItemProps>(
  ({ chat, className, ...props }, ref) => {
    const { chat: appChat, registerIntersectionObserver } = useApp();

    const internalRef = useRef<HTMLLIElement>(null);
    const itemRef = (ref as React.RefObject<HTMLLIElement>) || internalRef;

    const [isChatInView, setIsChatInView] = useState(false);

    const { data } = useInfiniteQuery({
      ...MessageListInfiniteQueryOptions({
        chat,
        limit: 1,
      }),
      enabled: isChatInView,
    });

    useEffect(() => {
      if (itemRef.current) {
        registerIntersectionObserver(itemRef.current, () => {
          setIsChatInView(true);
        });
      }
    }, [itemRef]);

    const last_message =
      data.pages[0]?.data.length > 0 ? data.pages[0]?.data[0] : undefined;

    return (
      <li
        key={chat.id}
        ref={itemRef}
        className={cn(
          "box-content p-2.5 h-11 flex items-center gap-4 hover:bg-black/5",
          chat.id === appChat?.id ? "bg-black/5" : "",
          className,
        )}
        {...props}
      >
        {chat.photo ? (
          <div
            className={cn(
              "shrink-0 w-12 h-12 clothoid-corner-2",
              chat.type === "chatroom"
                ? "relative after:content-[''] after:absolute after:inset-0 after:rounded-lg after:border-2 after:border-[#DDDFE0]"
                : "",
            )}
          >
            <Image
              width={48}
              height={48}
              className={"w-full h-full bg-[#DDDFE0]"}
              src={chat.photo}
            />
          </div>
        ) : (
          <div className={"shrink-0 w-12 h-12 rounded-lg bg-neutral-300"} />
        )}

        <div className="grow flex flex-col items-stretch">
          <div className="flex gap-2">
            <h4 className={"grow font-medium break-all line-clamp-1"}>
              {chat.title}
              {(chat.type === "private"
                ? chat.user.is_openim
                : chat.chatroom.is_openim) && (
                <span className="ms-1 text-sm font-normal text-orange-400">
                  @企业微信
                </span>
              )}
            </h4>
            {last_message && (
              <small className={"ms-2 text-xs text-neutral-400"}>
                {
                  formatDateTime(new Date(last_message.date * 1000)).split(
                    " ",
                  )[0]
                }
              </small>
            )}
          </div>
          <div
            className={"min-h-[1.5em] text-sm line-clamp-1 text-neutral-600"}
          >
            {last_message && (
              <Message
                variant="abstract"
                type={chat.type}
                message={last_message}
                showUsername={chat.type === "chatroom"}
                className={""}
              />
            )}
          </div>
        </div>
      </li>
    );
  },
);
