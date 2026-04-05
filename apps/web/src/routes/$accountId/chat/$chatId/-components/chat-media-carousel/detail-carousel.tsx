import { ScrollArea as BaseScrollArea } from "@base-ui/react";
import { useElementSize } from "@mantine/hooks";
import { MessageType, MessageTypeEnum } from "@repo/types";
import { DataAdapterCursorPagination } from "@repo/types/adapter";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo } from "react";
import { LoaderIcon } from "@/components/icon";
import { ImageMessage, VideoMessage } from "@/components/message";
import scrollAreaClasses from "@/components/ui/scroll-area.module.css";
import { cn } from "@/lib/utils";
import classes from "./index.module.css";
import { ScrollAreaViewportRelativePosition } from "./types";
import { createMessageURI, isVirtualizerReadyForScroll } from "./utils";
import { useChatMediaCarouselContext } from "@/routes/$accountId/chat/$chatId/-components/chat-media-carousel/chat-media-carousel-context.tsx";

interface DetailCarouselProps {
  setVirtualizerInstance: (
    virtualizer: Virtualizer<HTMLDivElement, Element>,
  ) => void;

  onVirtualizerReadyForScrollChange: (ready: boolean) => void;

  onScrollPositionChange: (
    position: ScrollAreaViewportRelativePosition,
  ) => void;
}

export default function DetailCarousel({
  setVirtualizerInstance,
  onVirtualizerReadyForScrollChange,
  onScrollPositionChange,
}: DetailCarouselProps) {
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

  const messages = useMemo(
    () =>
      (messageListInfiniteQueryResult.data?.pages ?? []).flatMap(
        (page) => page.data,
      ),
    [messageListInfiniteQueryResult.data],
  );

  // 每一项占满整个 viewport，因此viewportWidth 就是 itemSize
  const { ref: viewportRef, width: itemSize } = useElementSize();

  const virtualizer = useVirtualizer({
    horizontal: true,
    count: messages.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => itemSize,
    paddingStart: itemSize,
    paddingEnd: itemSize,
    anchorTo: "end",
    followOnAppend: false,
    getItemKey: (index) =>
      createMessageURI({ message: messages[index], account }),
    /**
     * 在 @tanstack/react-virtual 3.13.26 下
     * anchorTo: "end" 会在滚动位置因前面有新元素插入而改变后，修正滚动位置，
     * 但因为滚动位置改变时，原本在 viewport 范围内的 item 会因为超出 overscan 范围而被卸载
     * （尤其在此处，itemSize 等于 viewport size, 前方有新 item 插入后，很容易超出 overscan）
     * 滚动位置被修正后，item 重新挂载，视觉上出现闪烁的现象（图片等元素尤其）
     * 因此最简单的解决办法是将 overscan 设置为一个大于等于数据 page size 的值
     * （这些判断不一定正确，因为在调试中发现在开发者工具中观察，元素持续存在着）
     */
    overscan: 5,
  });

  useEffect(() => {
    setVirtualizerInstance(virtualizer);
  }, [virtualizer, setVirtualizerInstance]);

  useEffect(() => {
    virtualizer.measure();
  }, [itemSize, virtualizer]);

  // 通知父组件 virtualizer 是否已准备好可被滚动控制
  const isReadyForScroll = isVirtualizerReadyForScroll(virtualizer);
  useEffect(() => {
    onVirtualizerReadyForScrollChange(isReadyForScroll);
  }, [isReadyForScroll, onVirtualizerReadyForScrollChange]);

  const virtualItems = virtualizer.getVirtualItems();

  const handleOnScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (!virtualizer.scrollRect) return;

    const currentItem = virtualizer.getVirtualItemForOffset(
      event.currentTarget.scrollLeft,
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
        className={cn(
          scrollAreaClasses.Viewport,
          "snap-x snap-mandatory",
          "pb-2",
          classes.detailScrollAreaViewport,
          classes.carouselScrollAreaViewport,
        )}
        onScroll={(event) => {
          handleOnScroll(event);
        }}
      >
        <BaseScrollArea.Content
          className={cn(scrollAreaClasses.Content, "h-full relative")}
          style={{ width: virtualizer.getTotalSize() + itemSize * 2 }}
        >
          <div
            className="absolute inset-y-0 left-0 h-full relative"
            style={{ width: itemSize }}
          >
            {hasPreviousPage && (
              <LoaderIcon className="absolute inset-0 m-auto text-white opacity-75 animate-spin" />
            )}
          </div>

          {virtualItems.map((virtualItem) => {
            const message = messages[virtualItem.index];
            if (!message) return null;
            return (
              <div
                key={virtualItem.key}
                data-message-uri={createMessageURI({ message, account })}
                className={cn(
                  "snap-normal snap-center absolute top-0 h-full",
                  classes.carouselItemContainer,
                )}
                style={{
                  left: 0,
                  width: virtualItem.size,
                  transform: `translateX(${virtualItem.start}px)`,
                }}
              >
                <div className={classes.carouselItem}>
                  {message.type === MessageTypeEnum.IMAGE ? (
                    <ImageMessage.Plain
                      message={message}
                      sizes={["hd", "regular", "thumbnail"]}
                      className="max-w-full max-h-full"
                    />
                  ) : message.type === MessageTypeEnum.VIDEO ? (
                    <VideoMessage.Plain
                      message={message}
                      muted
                      className="max-w-full max-h-full"
                    />
                  ) : (
                    <div className="" />
                  )}
                </div>
              </div>
            );
          })}

          <div
            className="absolute inset-y-0 left-0 h-full"
            style={{
              width: itemSize,
              left: virtualizer.getTotalSize() + itemSize,
            }}
          >
            {hasPreviousPage && (
              <LoaderIcon className="absolute inset-0 m-auto text-white opacity-75 animate-spin" />
            )}
          </div>
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
    </BaseScrollArea.Root>
  );
}
