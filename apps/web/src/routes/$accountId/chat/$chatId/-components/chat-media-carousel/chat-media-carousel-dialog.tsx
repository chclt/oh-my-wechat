import { Dialog } from "@base-ui/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import dialogClasses from "@/components/ui/dialog.module.css";
import { cn } from "@/lib/utils";
import DetailCarousel from "./detail-carousel";
import ThumbCarousel from "./thumb-carousel";
import {
  ChatMediaCarouselContext,
  useChatMediaCarouselContext,
} from "@/routes/$accountId/chat/$chatId/-components/chat-media-carousel/chat-media-carousel-context.tsx";
import { useAccount } from "@/components/account-provider.tsx";
import { ScrollAreaViewportRelativePosition } from "@/routes/$accountId/chat/$chatId/-components/chat-media-carousel/types.ts";
import { createMessageURI } from "@/routes/$accountId/chat/$chatId/-components/chat-media-carousel/utils.ts";
import { Virtualizer } from "@tanstack/react-virtual";
import { MessageType } from "@repo/types";

export default function ChatMediaCarouselDialog({}) {
  const {
    account,
    chat,

    isDialogOpen,
    setIsDialogOpen,
    messageListInfiniteQueryResult,

    initialMessageRef,
  } = useChatMediaCarouselContext();

  const { isLoading: isFirstFetching } = messageListInfiniteQueryResult;

  const messages = useMemo<MessageType[]>(
    () =>
      (messageListInfiniteQueryResult.data?.pages ?? []).flatMap(
        (page) => page.data,
      ),
    [messageListInfiniteQueryResult.data?.pages],
  );

  const [detailVirtualizer, setDetailVirtualizer] = useState<Virtualizer<
    HTMLDivElement,
    Element
  > | null>(null);

  const [thumbVirtualizer, setThumbVirtualizer] = useState<Virtualizer<
    HTMLDivElement,
    Element
  > | null>(null);

  const [isDetailReadyForScroll, setIsDetailReadyForScroll] = useState(false);
  const [isThumbReadyForScroll, setIsThumbReadyForScroll] = useState(false);

  const detailScrollEventReasonRef = useRef<"self" | "controller">("self");
  const thumbScrollEventReasonRef = useRef<"self" | "controller">("self");

  const onDetailCarouselScrollPositionChange: (
    position: ScrollAreaViewportRelativePosition,
  ) => void = (position) => {
    if (!thumbVirtualizer) return;

    if (detailScrollEventReasonRef.current === "controller") {
      detailScrollEventReasonRef.current = "self";
      return;
    }

    // TODO: 使用 measurementsCache 是为了能找到当前不存在 DOM 中的项，但感觉使用这个 API 并不是被推荐的
    const targetIndex = messages.findIndex(
      (message) =>
        createMessageURI({ message, account }) === position.referenceMessageUri,
    );
    const targtItem = thumbVirtualizer.measurementsCache[targetIndex];
    if (!targtItem) return;

    const scrollLeft =
      targtItem.start + targtItem.size * (position.offsetProgress + 0.5);

    thumbScrollEventReasonRef.current = "controller";

    thumbVirtualizer.scrollToOffset(scrollLeft, {
      align: "center",
      behavior: "instant",
    });
  };

  const onThumbCarouselScrollPositionChange: (
    position: ScrollAreaViewportRelativePosition,
  ) => void = (position) => {
    if (!detailVirtualizer) return;

    if (thumbScrollEventReasonRef.current === "controller") {
      thumbScrollEventReasonRef.current = "self";
      return;
    }

    // TODO: 使用 measurementsCache 是为了能找到当前不存在 DOM 中的项，但感觉使用这个 API 并不是被推荐的
    const targetIndex = messages.findIndex(
      (message) =>
        createMessageURI({ message, account }) === position.referenceMessageUri,
    );
    const targetItem = detailVirtualizer.measurementsCache[targetIndex];

    if (!targetItem) return;

    const scrollLeft =
      targetItem.start + targetItem.size * (position.offsetProgress + 0.5);

    detailScrollEventReasonRef.current = "controller";

    detailVirtualizer.scrollToOffset(scrollLeft, {
      align: "center",
      behavior: "instant",
    });
  };

  // 打开时定位到指定消息
  useLayoutEffect(() => {
    if (
      isFirstFetching ||
      !detailVirtualizer ||
      !thumbVirtualizer ||
      !isDetailReadyForScroll ||
      !isThumbReadyForScroll
    )
      return;

    if (initialMessageRef.current) {
      const targetIndex = messages.findIndex(
        (message) =>
          createMessageURI({ message, account }) ===
          createMessageURI({
            message: initialMessageRef.current!,
            account,
          }),
      );

      if (targetIndex >= 0) {
        detailScrollEventReasonRef.current = "controller";
        detailVirtualizer.scrollToIndex(targetIndex, {
          align: "center",
          behavior: "instant",
        });

        thumbScrollEventReasonRef.current = "controller";
        thumbVirtualizer.scrollToIndex(targetIndex, {
          align: "center",
          behavior: "instant",
        });
      }
    }
  }, [isFirstFetching, isDetailReadyForScroll, isThumbReadyForScroll]);

  return (
    <Dialog.Root
      open={isDialogOpen}
      onOpenChange={(open) => setIsDialogOpen(open)}
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(dialogClasses.Backdrop, "bg-black/90")}
        />
        <Dialog.Viewport className={dialogClasses.Viewport}>
          <Dialog.Popup
            className={cn(
              "absolute inset-0 grid grid-cols-1 grid-rows-[1fr_min-content]",
            )}
          >
            <VisuallyHidden>
              <Dialog.Title>媒体文件浏览器</Dialog.Title>
              <Dialog.Description>媒体文件浏览器</Dialog.Description>
            </VisuallyHidden>

            <DetailCarousel
              setVirtualizerInstance={setDetailVirtualizer}
              onVirtualizerReadyForScrollChange={setIsDetailReadyForScroll}
              onScrollPositionChange={onDetailCarouselScrollPositionChange}
            />

            <ThumbCarousel
              setVirtualizerInstance={setThumbVirtualizer}
              onVirtualizerReadyForScrollChange={setIsThumbReadyForScroll}
              onScrollPositionChange={onThumbCarouselScrollPositionChange}
            />
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
