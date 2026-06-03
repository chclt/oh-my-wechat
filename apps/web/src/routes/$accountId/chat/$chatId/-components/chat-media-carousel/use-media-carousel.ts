import { useElementSize } from "@mantine/hooks";
import { MessageType, MessageTypeEnum } from "@repo/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageListInfiniteQueryOptions } from "@/lib/fetchers/message";
import { CarouselScrollViewportContextValue } from "./carousel-scroll-viewport-context";
import { useMediaCarouselPreparePhase } from "./use-media-carousel-prepare-phase";
import { useMediaCarouselScrollSync } from "./use-media-carousel-scroll-sync";
import { createMessageURI } from "./utils";

const PAGE_SIZE = 5;

interface UseMediaCarouselOptions {
	account: { id: string };
	chat: { id: string };
	isDialogOpen: boolean;
	initialMessage: MessageType | null;
	debug?: boolean;
}

interface CarouselSlice {
	virtualizer: Virtualizer<HTMLDivElement, Element>;
	viewportRef: (element: HTMLDivElement | null) => void;
	itemSize: number;
	onScroll: (event: React.UIEvent<HTMLDivElement, UIEvent>) => void;
}

export interface UseMediaCarouselResult {
	detail: CarouselSlice;
	thumb: CarouselSlice;
	messages: MessageType[];
	hasPreviousPage: boolean;
	hasNextPage: boolean;

	scrollLockContextValue: CarouselScrollViewportContextValue;
}

/**
 * 集中管理媒体浏览弹窗的两个 carousel 的状态机（状态驱动版本）。
 *
 * 编排步骤：
 *  1. dialog 打开 → useInfiniteQuery 自动 fetch 首页。
 *  2. 两个 viewport 在 React commit 阶段挂载，callback ref 把元素写到 state，
 *     useElementSize 通过 ResizeObserver 异步写入尺寸。
 *  3. useMediaCarouselPreparePhase 监听这些前置条件，
 *     齐全时算 initialOffset、写 ref、写 viewport.scrollLeft，
 *     最后 setPhase('ready')。
 *  4. virtualizer 在 phase==='ready' 时 enabled，首帧通过 initialOffset 拿到
 *     已写入的 offset 值，渲染目标项周围的 virtualItems。
 *  5. CarouselScrollViewport 通过 CarouselScrollLockContext 读取 phase==='ready'
 *     派生的 isLocked
 *
 * 跨次打开 dialog 时复用 measurements 缓存的需求暂未实现。
 */
export function useMediaCarousel(
	options: UseMediaCarouselOptions,
): UseMediaCarouselResult {
	const {
		account,
		chat,
		isDialogOpen,
		initialMessage,
		debug = false,
	} = options;

	// ----------------------------------------------------------
	// debug logger
	// ----------------------------------------------------------
	const debugLog = useCallback(
		(label: string, payload?: unknown) => {
			if (!debug) return;
			if (payload === undefined) {
				console.log(`[useMediaCarousel] ${label}`);
			} else {
				console.log(`[useMediaCarousel] ${label}`, payload);
			}
		},
		[debug],
	);

	// ----------------------------------------------------------
	// query
	// ----------------------------------------------------------

	const initialCursor = initialMessage?.date ?? null;

	const messageListInfiniteQueryResult = useInfiniteQuery({
		...MessageListInfiniteQueryOptions({
			account: { id: account.id },
			chat: { id: chat.id },
			type: [MessageTypeEnum.IMAGE, MessageTypeEnum.VIDEO],
			cursor: JSON.stringify({
				value: initialCursor,
				condition: "<>",
			}),
			limit: PAGE_SIZE,
		}),
		enabled: !!initialCursor && isDialogOpen,
	});

	const messages = useMemo<MessageType[]>(
		() =>
			(messageListInfiniteQueryResult.data?.pages ?? []).flatMap(
				(page) => page.data,
			),
		[messageListInfiniteQueryResult.data?.pages],
	);

	const {
		hasPreviousPage,
		fetchPreviousPage,
		isFetchingPreviousPage,

		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = messageListInfiniteQueryResult;

	// ----------------------------------------------------------
	// viewport elements / sizes
	//
	// element 用 useState 管理，确保挂载/卸载会触发 re-render，
	// 让下游 effect（prepare phase）能感知到。
	// ----------------------------------------------------------

	const [detailViewportElement, setDetailViewportElement] =
		useState<HTMLDivElement | null>(null);
	const [thumbViewportElement, setThumbViewportElement] =
		useState<HTMLDivElement | null>(null);

	// detail viewport：每一项铺满，所以 itemSize === viewportWidth
	const { ref: detailMantineRef, width: detailViewportWidth } =
		useElementSize();

	// thumb viewport：每一项是正方形，高度等于 viewport 高度
	const {
		ref: thumbMantineRef,
		width: thumbViewportWidth,
		height: thumbItemSize,
	} = useElementSize();

	const setDetailViewport = useCallback(
		(element: HTMLDivElement | null) => {
			setDetailViewportElement(element);
			detailMantineRef.current = element;
		},
		[detailMantineRef],
	);

	const setThumbViewport = useCallback(
		(element: HTMLDivElement | null) => {
			setThumbViewportElement(element);
			thumbMantineRef.current = element;
		},
		[thumbMantineRef],
	);

	const detailItemSize = detailViewportWidth;
	const detailPaddingStart = detailItemSize;
	const thumbSpacerWidth = Math.max(
		(thumbViewportWidth - thumbItemSize) / 2,
		0,
	);

	// ----------------------------------------------------------
	// prepare phase 状态机
	// ----------------------------------------------------------
	const { phase, detailInitialOffsetRef, thumbInitialOffsetRef } =
		useMediaCarouselPreparePhase({
			isDialogOpen,
			account,
			messages,
			initialMessage,
			detailViewportElement,
			thumbViewportElement,
			detailItemSize,
			detailViewportWidth,
			thumbItemSize,
			thumbViewportWidth,
			debugLog,
		});

	// chat 留作未来跨次打开复用 measurements 缓存的 cache key 维度
	void chat;

	// ----------------------------------------------------------
	// virtualizers
	// ----------------------------------------------------------

	const detailVirtualizer = useVirtualizer({
		enabled: phase === "ready",
		horizontal: true,
		count: messages.length,
		getScrollElement: () => detailViewportElement,
		estimateSize: () => detailItemSize,
		paddingStart: detailPaddingStart,
		paddingEnd: detailPaddingStart,
		anchorTo: "end",
		followOnAppend: false,
		getItemKey: (index) =>
			createMessageURI({ message: messages[index], account }),
		initialOffset: () => detailInitialOffsetRef.current,
		initialRect: { width: detailViewportWidth, height: 0 },
		overscan: 2,
	});

	const thumbVirtualizer = useVirtualizer({
		enabled: phase === "ready",
		horizontal: true,
		count: messages.length,
		getScrollElement: () => thumbViewportElement,
		estimateSize: () => thumbItemSize,
		paddingStart: thumbSpacerWidth,
		paddingEnd: thumbSpacerWidth,
		anchorTo: "end",
		followOnAppend: false,
		getItemKey: (index) =>
			createMessageURI({ message: messages[index], account }),
		initialOffset: () => thumbInitialOffsetRef.current,
		initialRect: { width: thumbViewportWidth, height: thumbItemSize },
		overscan: 4,
	});

	useEffect(() => {
		detailVirtualizer.measure();
	}, [detailItemSize, detailVirtualizer]);

	useEffect(() => {
		thumbVirtualizer.measure();
	}, [thumbSpacerWidth, thumbItemSize, thumbVirtualizer]);

	// ----------------------------------------------------------
	// prefetch（受 phase 短路）
	// ----------------------------------------------------------

	const detailVirtualIndexes = detailVirtualizer.getVirtualIndexes();
	const detailFirstIndex = detailVirtualIndexes[0];
	const detailLastIndex = detailVirtualIndexes[detailVirtualIndexes.length - 1];

	useEffect(() => {
		if (phase !== "ready") return;
		if (messages.length === 0) return;

		if (detailFirstIndex === 0 && hasPreviousPage && !isFetchingPreviousPage) {
			fetchPreviousPage();
		}

		if (
			detailLastIndex === messages.length - 1 &&
			hasNextPage &&
			!isFetchingNextPage
		) {
			fetchNextPage();
		}
	}, [
		phase,
		detailFirstIndex,
		detailLastIndex,
		messages.length,
		hasPreviousPage,
		hasNextPage,
		isFetchingPreviousPage,
		isFetchingNextPage,
		fetchPreviousPage,
		fetchNextPage,
	]);

	// ----------------------------------------------------------
	// scroll sync
	// ----------------------------------------------------------
	const { handleDetailScroll, handleThumbScroll } = useMediaCarouselScrollSync({
		phase,
		account,
		messages,
		detailVirtualizer,
		thumbVirtualizer,
		debugLog,
	});

	// ----------------------------------------------------------
	// 返回值
	// ----------------------------------------------------------

	const isLocked = phase !== "ready";

	const scrollLockContextValue: CarouselScrollViewportContextValue = {
		detail: {
			isLocked,
			carouselPaddingStart: detailPaddingStart,
			carouselPaddingEnd: detailPaddingStart,
		},
		thumb: {
			isLocked,
			carouselPaddingStart: thumbSpacerWidth,
			carouselPaddingEnd: thumbSpacerWidth,
		},
	};

	return {
		detail: {
			virtualizer: detailVirtualizer,
			viewportRef: setDetailViewport,
			itemSize: detailItemSize,
			onScroll: handleDetailScroll,
		},
		thumb: {
			virtualizer: thumbVirtualizer,
			viewportRef: setThumbViewport,
			itemSize: thumbItemSize,
			onScroll: handleThumbScroll,
		},
		messages,
		hasPreviousPage,
		hasNextPage,
		scrollLockContextValue,
	};
}
