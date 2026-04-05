import {
  createContext,
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
} from "react";
import { AccountType, ChatType, MessageType } from "@repo/types";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { DataAdapterCursorPagination } from "@repo/types/adapter";

interface ChatMediaCarouselContextApi {
  openChatMediaCarousel: (message: MessageType) => void;
}

export interface ChatMediaCarouselContextProps
  extends ChatMediaCarouselContextApi {
  account: {
    id: string;
  };
  chat: {
    id: string;
  };
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;

  messageListInfiniteQueryResult: UseInfiniteQueryResult<
    InfiniteData<DataAdapterCursorPagination<MessageType[]>, unknown>,
    Error
  >;

  initialMessageRef: RefObject<MessageType | null>;
}

export const ChatMediaCarouselContext =
  createContext<ChatMediaCarouselContextProps | null>(null);

export function useChatMediaCarouselContext() {
  const context = useContext(ChatMediaCarouselContext);
  if (!context) {
    throw new Error(
      "useChatMediaCarouselContext must be used within a ChatMediaCarouselContext",
    );
  }
  return context;
}
