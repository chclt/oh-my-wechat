import { MessageType, MessageTypeEnum } from "@repo/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { MessageListInfiniteQueryOptions } from "@/lib/fetchers/message";
import { Route } from "../../route";
import {
  ChatMediaCarouselContext,
  ChatMediaCarouselContextProps,
} from "./chat-media-carousel-context";

interface ChatMediaCarouselRootProps {
  account: {
    id: string;
  };
  chat: {
    id: string;
  };

  children: React.ReactNode;
}

export default function ChatMediaCarouselRoot({
  account,
  chat,

  children,
}: ChatMediaCarouselRootProps) {
  const { accountId } = Route.useParams();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [initialCursor, setInitialCursor] = useState<
    MessageType["date"] | null
  >(null);

  const initialMessageRef = useRef<MessageType | null>(null);

  const openChatMediaCarousel: ChatMediaCarouselContextProps["openChatMediaCarousel"] =
    (message) => {
      initialMessageRef.current = message;
      setInitialCursor(message.date);
      setIsDialogOpen(true);
    };

  const messageListInfiniteQueryResult = useInfiniteQuery({
    ...MessageListInfiniteQueryOptions({
      account: { id: accountId },
      chat: { id: chat.id },
      type: [MessageTypeEnum.IMAGE, MessageTypeEnum.VIDEO],
      cursor: JSON.stringify({
        value: initialCursor,
        condition: "<>",
      }),
      limit: 5,
    }),
    enabled: !!initialCursor,
  });

  return (
    <ChatMediaCarouselContext
      value={{
        account,
        chat,
        isDialogOpen,
        setIsDialogOpen,
        messageListInfiniteQueryResult,
        initialMessageRef,

        openChatMediaCarousel,
      }}
    >
      {children}
    </ChatMediaCarouselContext>
  );
}
