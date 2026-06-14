import { ScrollArea as BaseScrollArea } from "@base-ui/react";
import type { CSSProperties } from "react";
import { useCarouselScrollViewportContext } from "./carousel-scroll-viewport-context";

type CarouselSlice = "detail" | "thumb";

type CarouselScrollViewportProps = React.ComponentProps<
	typeof BaseScrollArea.Viewport
> & {
	slice: CarouselSlice;
};

type CarouselScrollViewportStyle = NonNullable<
	CarouselScrollViewportProps["style"]
>;
type CarouselScrollViewportStyleFunction = Extract<
	CarouselScrollViewportStyle,
	(...args: never[]) => unknown
>;
type CarouselScrollViewportStyleState =
	Parameters<CarouselScrollViewportStyleFunction>[0];

export function CarouselScrollViewport({
	slice,
	style,
	...rest
}: CarouselScrollViewportProps) {
	const lockState = useCarouselScrollViewportContext()[slice];

	const composeStyle = (resolvedStyle?: CSSProperties) =>
		({
			"--carousel-padding-start": `${lockState.carouselPaddingStart}px`,
			"--carousel-padding-end": `${lockState.carouselPaddingEnd}px`,
			"--carousel-scroll-start": `var(--scroll-area-overflow-x-start)`,
			scrollSnapType: "x mandatory",
			...resolvedStyle,
			...(lockState.isLocked
				? { overflow: "hidden", scrollSnapType: "none" }
				: undefined),
		}) as unknown as CSSProperties;

	const composedStyle =
		typeof style === "function"
			? (state: CarouselScrollViewportStyleState) => composeStyle(style(state))
			: composeStyle(style);

	return <BaseScrollArea.Viewport style={composedStyle} {...rest} />;
}
