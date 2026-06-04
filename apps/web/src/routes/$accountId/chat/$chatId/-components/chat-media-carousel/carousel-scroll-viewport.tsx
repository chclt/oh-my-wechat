import { ScrollArea as BaseScrollArea } from "@base-ui/react";
import type { CSSProperties } from "react";
import { useCarouselScrollViewportContext } from "./carousel-scroll-viewport-context";

type CarouselSlice = "detail" | "thumb";

type CarouselScrollViewportProps = React.ComponentProps<
	typeof BaseScrollArea.Viewport
> & {
	slice: CarouselSlice;
};

export function CarouselScrollViewport({
	slice,
	style,
	...rest
}: CarouselScrollViewportProps) {
	const lockState = useCarouselScrollViewportContext()[slice];

	const composedStyle = {
		"--carousel-padding-start": `${lockState.carouselPaddingStart}px`,
		"--carousel-padding-end": `${lockState.carouselPaddingEnd}px`,
		"--carousel-scroll-start": `var(--scroll-area-overflow-x-start)`,
		scrollSnapType: "x mandatory",
		...style,
		...(lockState.isLocked
			? { overflow: "hidden", scrollSnapType: "none" }
			: undefined),
	} as unknown as CSSProperties;

	return <BaseScrollArea.Viewport style={composedStyle} {...rest} />;
}
