import type { Virtualizer } from "@tanstack/react-virtual";
import type { UIEventHandler } from "react";

export type CarouselKind = "detail" | "thumb";
export type CarouselVirtualizer = Virtualizer<HTMLDivElement, Element>;

export interface CarouselGeometry {
	itemSize: number;
	viewportSize: number;
	padding: number;
}

/** A stable message identity plus the viewport center's offset in item widths. */
export interface CarouselPosition {
	messageKey: string;
	progress: number;
}

export interface CarouselViewportBindings {
	ref: (element: HTMLDivElement | null) => void;
	onScroll: UIEventHandler<HTMLDivElement>;
	onInteraction: () => void;
	isReady: boolean;
	isSnapEnabled: boolean;
	padding: number;
}

export interface CarouselView {
	virtualizer: CarouselVirtualizer;
	viewport: CarouselViewportBindings;
}
