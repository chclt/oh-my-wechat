import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useLayoutEffect } from "react";
import { getCenteredOffset } from "./carousel-position";
import type { CarouselScrollController } from "./carousel-scroll-controller";
import type { CarouselKind, CarouselVirtualizer } from "./types";
import type { CarouselLayout } from "./use-carousel-layout";

interface Options {
	kind: CarouselKind;
	keys: readonly string[];
	layout: CarouselLayout;
	initialIndex: number;
	enabled: boolean;
	controller: CarouselScrollController;
}

/** Library-owned measurements, range selection and prepend anchoring. */
export function useFixedCarousel({
	kind,
	keys,
	layout,
	initialIndex,
	enabled,
	controller,
}: Options) {
	"use no memo";
	const { element, geometry } = layout;
	const { itemSize, viewportSize, padding } = geometry;
	const getItemKey = useCallback((index: number) => keys[index], [keys]);
	const anchorIndex = keys.indexOf(controller.messageKey);
	const rangeExtractor = useCallback<
		NonNullable<CarouselVirtualizer["options"]["rangeExtractor"]>
	>(
		(range) => {
			const indexes = defaultRangeExtractor(range);
			// A native snap target must exist in the DOM, including while a resize
			// or a large scroll temporarily puts it outside the virtual range.
			return anchorIndex >= 0 && !indexes.includes(anchorIndex)
				? [...indexes, anchorIndex].sort((a, b) => a - b)
				: indexes;
		},
		[anchorIndex],
	);
	const virtualizer = useVirtualizer<HTMLDivElement, Element>({
		enabled,
		horizontal: true,
		count: keys.length,
		getScrollElement: () => element,
		estimateSize: () => itemSize,
		getItemKey,
		rangeExtractor,
		paddingStart: padding,
		paddingEnd: padding,
		anchorTo: "end",
		initialOffset: getCenteredOffset(Math.max(initialIndex, 0), geometry),
		initialRect: { width: viewportSize, height: 0 },
		overscan: kind === "detail" ? 2 : 4,
	});
	useLayoutEffect(() => {
		virtualizer.measure();
	}, [virtualizer, itemSize, padding]);

	return virtualizer;
}
