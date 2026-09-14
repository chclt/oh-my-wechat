import { useMemo } from "react";
import { useCarouselLayout } from "./use-carousel-layout";
import { useFixedCarousel } from "./use-fixed-carousel";
import {
	useCarouselController,
	useMediaCarouselScrollSync,
} from "./use-media-carousel-scroll-sync";
import {
	type MediaPagesOptions,
	useMediaPages,
	useMediaPageWindow,
	useMediaPagination,
} from "./use-media-pages";
import { createMessageURI } from "./utils";

/** One mounted dialog session. Coordinates data, layout and position ownership. */
export function useMediaCarousel(options: MediaPagesOptions) {
	"use no memo";
	const pages = useMediaPages(options);
	const pageWindow = useMediaPageWindow(pages);
	const { messages } = pageWindow;
	const keys = useMemo(
		() =>
			messages.map((message) =>
				createMessageURI({ message, account: options.account }),
			),
		[messages, options.account.id],
	);
	const initialKey = createMessageURI({
		message: options.initialMessage,
		account: options.account,
	});
	const initialIndex = useMemo(
		() => keys.indexOf(initialKey),
		[keys, initialKey],
	);
	const controller = useCarouselController(initialKey);
	const detailLayout = useCarouselLayout("detail");
	const thumbLayout = useCarouselLayout("thumb");
	const isReady =
		initialIndex >= 0 && detailLayout.isMeasured && thumbLayout.isMeasured;

	const detailVirtualizer = useFixedCarousel({
		kind: "detail",
		keys,
		layout: detailLayout,
		initialIndex,
		enabled: isReady,
		controller,
	});
	const thumbVirtualizer = useFixedCarousel({
		kind: "thumb",
		keys,
		layout: thumbLayout,
		initialIndex,
		enabled: isReady,
		controller,
	});
	const scroll = useMediaCarouselScrollSync({
		controller,
		keys,
		isReady,
		detail: { layout: detailLayout, virtualizer: detailVirtualizer },
		thumb: { layout: thumbLayout, virtualizer: thumbVirtualizer },
	});
	const indexes = thumbVirtualizer.getVirtualIndexes();
	const retry = useMediaPagination({
		pages,
		pageWindow,
		isReady,
		isScrolling: detailVirtualizer.isScrolling || thumbVirtualizer.isScrolling,
		firstIndex: indexes[0],
		lastIndex: indexes.at(-1),
	});
	const { query } = pages;
	return {
		...scroll,
		messages,
		retry,
		hasPreviousPage: query.hasPreviousPage,
		hasNextPage: query.hasNextPage,
		isLoading: !messages.length && !query.isError,
		isFetching: query.isFetching,
		error: query.isError
			? "媒体加载失败，请重试。"
			: query.isSuccess && !pageWindow.hasPendingPages && initialIndex < 0
				? "未找到选中的媒体。"
				: null,
	};
}
