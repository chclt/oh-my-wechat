import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useLayoutEffect } from "react";
import { getCenteredOffset } from "./carousel-position";
import type { CarouselKind } from "./types";
import type { CarouselLayout } from "./use-carousel-layout";

interface Options {
	kind: CarouselKind;
	keys: readonly string[];
	layout: CarouselLayout;
	initialIndex: number;
	enabled: boolean;
}

/** Library-owned measurements, range selection and prepend anchoring. */
export function useFixedCarousel({
	kind,
	keys,
	layout,
	initialIndex,
	enabled,
}: Options) {
	"use no memo";
	const { element, geometry } = layout;
	const { itemSize, viewportSize, padding } = geometry;
	const getItemKey = useCallback((index: number) => keys[index], [keys]);
	const virtualizer = useVirtualizer<HTMLDivElement, Element>({
		enabled,
		horizontal: true,
		count: keys.length,
		getScrollElement: () => element,
		estimateSize: () => itemSize,
		getItemKey,
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
