import { useLayoutEffect, useState } from "react";
import type { CarouselGeometry, CarouselKind } from "./types";

/** Seed virtual estimates from the viewport immediately; observe later resizes. */
export function useCarouselLayout(kind: CarouselKind) {
	const [element, ref] = useState<HTMLDivElement | null>(null);
	const [{ width, height }, setSize] = useState({ width: 0, height: 0 });
	useLayoutEffect(() => {
		if (!element) return;
		const measure = () => {
			const width = element.clientWidth;
			const height = element.clientHeight;
			setSize((previous) =>
				previous.width === width && previous.height === height
					? previous
					: { width, height },
			);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, [element]);
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
