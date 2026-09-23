import type { MessageType } from "@repo/types";
import type { Virtualizer } from "@tanstack/react-virtual";
import type { ReactNode, UIEventHandler } from "react";
import type { MediaPreviewData } from "./media-carousel-preview-context";

export type CarouselKind = "detail" | "thumb";
export type CarouselVirtualizer = Virtualizer<HTMLDivElement, Element>;
export type CarouselMessageAnchor = Pick<MessageType, "local_id" | "date">;

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

export interface ChatMediaCarouselRootProps {
	account: { id: string };
	chat: { id: string };
	children: ReactNode;
}

export interface ViewerState {
	isOpen: boolean;
	/** This direction uses Dialog fades: scrolling or unavailable transition endpoints. */
	transitionDisabled: boolean;
	/** Last displayed media key; retained when the viewport is on empty padding. */
	targetKey: string | null;
	initialMessageAnchor: CarouselMessageAnchor | null;
	sessionKey: number;
	previewData: MediaPreviewData;
}
