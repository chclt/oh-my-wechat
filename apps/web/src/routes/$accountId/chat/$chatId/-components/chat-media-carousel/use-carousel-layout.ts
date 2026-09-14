import { useElementSize } from "@mantine/hooks";
import { useCallback, useState } from "react";
import type { CarouselGeometry, CarouselKind } from "./types";

/** Both tracks use fixed-size cells: full viewport width or square thumbnails. */
export function useCarouselLayout(kind: CarouselKind) {
	const [element, setElement] = useState<HTMLDivElement | null>(null);
	const { ref: sizeRef, width, height } = useElementSize<HTMLDivElement>();
	const ref = useCallback(
		(node: HTMLDivElement | null) => {
			setElement(node);
			sizeRef.current = node;
		},
		[sizeRef],
	);
	const itemSize = kind === "detail" ? width : height;
	const geometry: CarouselGeometry = {
		itemSize,
		viewportSize: width,
		padding: kind === "detail" ? width : Math.max((width - itemSize) / 2, 0),
	};
	return {
		element,
		ref,
		geometry,
		isMeasured: !!element && width > 0 && itemSize > 0,
	};
}

export type CarouselLayout = ReturnType<typeof useCarouselLayout>;
