import type { CSSProperties } from "react";
import type { Rect } from "@/components/view-transition";
import type { MediaPreviewData } from "./media-carousel-preview-context";

const inlineInset = 6;
const thumbSize = 6;
const thumbGap = 0.5;

/** One source for the CSS layout and the opening estimate. Values are in rem. */
export const mediaCarouselLayout = {
	"--media-inline-inset": `${inlineInset}rem`,
	"--media-thumb-size": `${thumbSize}rem`,
	"--media-bottom-inset": `${thumbSize + thumbGap}rem`,
} as CSSProperties;

export function estimateDetailImageRect(
	parent: HTMLElement,
	data: MediaPreviewData,
): Rect {
	const rem = parseFloat(
		getComputedStyle(parent.ownerDocument.documentElement).fontSize,
	);
	const availableHeight = parent.clientHeight - (thumbSize + thumbGap) * rem;
	const ratio = data.width && data.height ? data.width / data.height : 4 / 3;
	const width = Math.max(
		1,
		Math.min(
			// Match the detail image's auto size and max constraints: never upscale.
			data.width ?? Infinity,
			parent.clientWidth - inlineInset * rem * 2,
			availableHeight * ratio,
		),
	);
	const height = width / ratio;
	return {
		x: (parent.clientWidth - width) / 2,
		y: (availableHeight - height) / 2,
		width,
		height,
	};
}
