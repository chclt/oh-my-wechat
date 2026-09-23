import { ScrollArea as BaseScrollArea } from "@base-ui/react";
import { useMergedRef } from "@mantine/hooks";
import type { ComponentProps, CSSProperties } from "react";
import type { CarouselViewportBindings } from "./types";

type Props = Omit<ComponentProps<typeof BaseScrollArea.Viewport>, "style"> & {
	viewport: CarouselViewportBindings;
	style?: CSSProperties;
};

/** Native snap applies to both user gestures and programmatic instant writes. */
export function CarouselScrollViewport({
	viewport,
	ref,
	style,
	...props
}: Props) {
	const mergedRef = useMergedRef(viewport.ref, ref);
	const viewportStyle: CSSProperties & Record<`--carousel-${string}`, string> =
		{
			...style,
			"--carousel-padding-start": `${viewport.padding}px`,
			"--carousel-padding-end": `${viewport.padding}px`,
			"--carousel-scroll-start": "var(--scroll-area-overflow-x-start)",
			scrollSnapType:
				viewport.isReady && viewport.isSnapEnabled ? "x mandatory" : "none",
			...(!viewport.isReady ? { overflow: "hidden" } : {}),
		};
	return (
		<BaseScrollArea.Viewport
			{...props}
			ref={mergedRef}
			style={viewportStyle}
			onScroll={viewport.onScroll}
			onWheelCapture={viewport.onInteraction}
			onPointerDownCapture={viewport.onInteraction}
			onKeyDownCapture={viewport.onInteraction}
		/>
	);
}
