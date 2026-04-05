import { ScrollArea as BaseScrollArea } from "@base-ui/react";
import { useElementSize } from "@mantine/hooks";
import { MessageType, MessageTypeEnum } from "@repo/types";
import { DataAdapterCursorPagination } from "@repo/types/adapter";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LoaderIcon } from "@/components/icon";
import { ImageMessage, VideoMessage } from "@/components/message";
import scrollAreaClasses from "@/components/ui/scroll-area.module.css";
import { cn } from "@/lib/utils";
import { ScrollAreaViewportRelativePosition } from "./types";
import { createMessageURI, isVirtualizerReadyForScroll } from "./utils";
import { useChatMediaCarouselContext } from "@/routes/$accountId/chat/$chatId/-components/chat-media-carousel/chat-media-carousel-context.tsx";

interface ThumbCarouselProps {
  setVirtualizerInstance: (
    virtualizer: Virtualizer<HTMLDivElement, Element>,
  ) => void;
  onVirtualizerReadyForScrollChange: (ready: boolean) => void;
  onScrollPositionChange: (
    position: ScrollAreaViewportRelativePosition,
  ) => void;
}

export default function ThumbCarousel({
  setVirtualizerInstance,
  onVirtualizerReadyForScrollChange,
  onScrollPositionChange,
}: ThumbCarouselProps) {
  const { account, chat, messageListInfiniteQueryResult } =
    useChatMediaCarouselContext();

  const {
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,

    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = messageListInfiniteQueryResult;

  const messages = (messageListInfiniteQueryResult.data?.pages ?? []).flatMap(
    (page) => page.data,
  );

  // 因为每一个项目宽高比是 1:1，所以 viewportHeight 就是 itemSize。
  const {
    ref: viewportRef,
    width: viewportWidth,
    height: itemSize,
  } = useElementSize();

  const [spacerWidth, setSpacerWidth] = useState(0);

  useLayoutEffect(() => {
    setSpacerWidth((viewportWidth - itemSize) / 2);
  }, [viewportWidth, itemSize]);

  const virtualizer = useVirtualizer({
    horizontal: true,
    count: messages.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => itemSize,
    paddingStart: spacerWidth,
    paddingEnd: spacerWidth,
    anchorTo: "end",
    followOnAppend: false,
    getItemKey: (index) =>
      createMessageURI({ message: messages[index], account }),
    overscan: 4,
  });

  useEffect(() => {
    setVirtualizerInstance(virtualizer);
  }, [virtualizer, setVirtualizerInstance]);

  useEffect(() => {
    virtualizer.measure();
  }, [spacerWidth, virtualizer]);

  const isReadyForScroll = isVirtualizerReadyForScroll(virtualizer);
  useEffect(() => {
    onVirtualizerReadyForScrollChange(isReadyForScroll);
  }, [isReadyForScroll, onVirtualizerReadyForScrollChange]);

  const virtualItems = virtualizer.getVirtualItems();

  const firstIndex = virtualItems[0]?.index;
  const lastIndex = virtualItems[virtualItems.length - 1]?.index;
  useEffect(() => {
    if (messages.length === 0) return;

    if (firstIndex === 0 && hasPreviousPage && !isFetchingPreviousPage) {
      fetchPreviousPage();
    }

    if (
      lastIndex === messages.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [firstIndex, lastIndex, messages.length]);

  const handleOnScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (!virtualizer.scrollRect) return;

    const currentItem = virtualizer.getVirtualItemForOffset(
      event.currentTarget.scrollLeft + virtualizer.scrollRect.width / 2,
    );

    if (!currentItem) return;

    const currentScrollOffset = event.currentTarget.scrollLeft;

    const currentProgress =
      (currentScrollOffset +
        virtualizer.scrollRect.width / 2 -
        currentItem.size / 2 -
        currentItem.start) /
      currentItem.size;

    onScrollPositionChange({
      referenceMessageUri: String(currentItem.key),
      offsetProgress: currentProgress,
    });
  };

  return (
    <BaseScrollArea.Root
      data-slot="scroll-area"
      className={cn(scrollAreaClasses.Root, "@container overflow-hidden")}
    >
      <BaseScrollArea.Viewport
        ref={viewportRef}
        className={cn(scrollAreaClasses.Viewport, "snap-x snap-mandatory")}
        onScroll={handleOnScroll}
      >
        <BaseScrollArea.Content
          className={cn(scrollAreaClasses.Content, "h-24 relative")}
          style={{ width: virtualizer.getTotalSize() }}
        >
          <div
            className="absolute inset-y-0 left-0 h-full relative"
            style={{ width: spacerWidth }}
          >
            {hasPreviousPage && (
              <LoaderIcon
                className="absolute inset-y-0 my-auto end-9 text-white opacity-75 animate-spin"
                onClick={() => {
                  fetchPreviousPage();
                }}
              />
            )}
          </div>

          {virtualItems.map((virtualItem) => {
            const message = messages[virtualItem.index];
            if (!message) return null;
            return (
              <div
                key={virtualItem.key}
                data-message-uri={createMessageURI({ message, account })}
                className="absolute inset-y-0 snap-center size-24 p-2"
                style={{
                  left: 0,
                  transform: `translateX(${virtualItem.start}px)`,
                }}
              >
                {message.type === MessageTypeEnum.IMAGE ? (
                  <ImageMessage.Plain
                    message={message}
                    sizes={["thumbnail", "regular"]}
                    className="size-full object-cover rounded"
                  />
                ) : message.type === MessageTypeEnum.VIDEO ? (
                  <VideoMessage.PlainCover
                    message={message}
                    className="size-full object-cover rounded"
                  />
                ) : (
                  <div className="size-24" />
                )}
              </div>
            );
          })}

          <div
            className="absolute inset-y-0 right-0 h-full"
            style={{
              width: spacerWidth,
            }}
          >
            {hasNextPage && (
              <LoaderIcon
                className="absolute inset-y-0 my-auto start-9 text-white opacity-75 animate-spin"
                onClick={() => {
                  fetchNextPage();
                }}
              />
            )}
          </div>
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
    </BaseScrollArea.Root>
  );
}
