import { useLayoutEffect, useState } from "react";
import { CarouselScrollController } from "./carousel-scroll-controller";
import type { CarouselKind, CarouselView, CarouselVirtualizer } from "./types";
import type { CarouselLayout } from "./use-carousel-layout";

export function useCarouselController(initialMessageKey: string) {
	const [controller] = useState(
		() => new CarouselScrollController(initialMessageKey),
	);
	return controller;
}

interface Track {
	layout: CarouselLayout;
	virtualizer: CarouselVirtualizer;
}

interface Options {
	controller: CarouselScrollController;
	keys: readonly string[];
	isReady: boolean;
	detail: Track;
	thumb: Track;
}

/** Both directions share continuous coordinates; CSS controls where they snap. */
export function useMediaCarouselScrollSync({
	controller,
	keys,
	isReady,
	detail,
	thumb,
}: Options) {
	"use no memo";

	const [source, setSource] = useState<CarouselKind>("detail");
	const isThumbFollowing =
		source === "detail" && detail.virtualizer.isScrolling;
	const messageKey = controller.messageKey;
	const { geometry: detailGeometry } = detail.layout;
	const { geometry: thumbGeometry } = thumb.layout;
	useLayoutEffect(() => {
		if (!isReady) return;
		const viewport = ({ layout }: Track) => ({
			geometry: layout.geometry,
			getOffset: () => layout.element?.scrollLeft ?? 0,
			getViewportSize: () => layout.element?.clientWidth ?? 0,
			// Native snap determines the landing position. Virtualizer's scrollToOffset
			// would keep a reconciliation loop alive for an unreachable fractional target.
			scrollTo: (offset: number) =>
				layout.element?.scrollTo({ left: offset, behavior: "instant" }),
		});
		controller.update(keys, {
			detail: viewport(detail),
			thumb: viewport(thumb),
		});
	}, [
		controller,
		keys,
		isReady,
		detail.layout.element,
		thumb.layout.element,
		detailGeometry.itemSize,
		detailGeometry.viewportSize,
		detailGeometry.padding,
		thumbGeometry.itemSize,
		thumbGeometry.viewportSize,
		thumbGeometry.padding,
	]);
	// The destination snap target or snap style may only just have committed.
	// Retry the follower after commit without interrupting the source gesture.
	useLayoutEffect(() => {
		controller.syncFollower();
	}, [controller, messageKey, source, isThumbFollowing]);

	const bind = (kind: CarouselKind, track: Track): CarouselView => ({
		virtualizer: track.virtualizer,
		viewport: {
			ref: track.layout.ref,
			padding: track.layout.geometry.padding,
			isReady,
			// Only suspend thumbnail snap while following an active detail scroll.
			// Virtualizer's idle transition restores snap without a separate timer.
			isSnapEnabled: kind === "detail" || !isThumbFollowing,
			onInteraction: () => {
				controller.takeControl(kind);
				setSource(kind);
			},
			onScroll: () => {
				if (isReady) controller.onScroll(kind);
			},
		},
	});
	return {
		detail: bind("detail", detail),
		thumb: bind("thumb", thumb),
		previous: () => controller.moveBy(-1),
		next: () => controller.moveBy(1),
	};
}
