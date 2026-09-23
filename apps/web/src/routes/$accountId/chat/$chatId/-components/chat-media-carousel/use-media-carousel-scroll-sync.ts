import {
	useCallback,
	useLayoutEffect,
	useState,
	useSyncExternalStore,
} from "react";
import type { CarouselScrollController } from "./carousel-scroll-controller";
import type { CarouselKind, CarouselView, CarouselVirtualizer } from "./types";
import type { CarouselLayout } from "./use-carousel-layout";

interface Track {
	layout: CarouselLayout;
	virtualizer: CarouselVirtualizer;
}

interface Options {
	controller: CarouselScrollController;
	keys: readonly string[];
	isReady: boolean;
	onCurrentKeyChange: (key: string) => void;
	detail: Track;
	thumb: Track;
}

/** Both directions share continuous coordinates; CSS controls where they snap. */
export function useMediaCarouselScrollSync({
	controller,
	keys,
	isReady,
	onCurrentKeyChange,
	detail,
	thumb,
}: Options) {
	"use no memo";

	const source = useSyncExternalStore(
		controller.subscribeSource,
		controller.getSource,
		controller.getSource,
	);
	const isThumbFollowing =
		source === "detail" && detail.virtualizer.isScrolling;
	const messageKey = controller.messageKey;
	const [currentKey, setCurrentKey] = useState<string | null>(null);
	const updateCurrentKey = useCallback(() => {
		const key = controller.currentKey;
		setCurrentKey(key);
		if (key) onCurrentKeyChange(key);
	}, [controller, onCurrentKeyChange]);
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
		updateCurrentKey();
	}, [
		controller,
		keys,
		isReady,
		updateCurrentKey,
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
		updateCurrentKey();
	}, [controller, messageKey, source, isThumbFollowing, updateCurrentKey]);

	const bind = (kind: CarouselKind, track: Track): CarouselView => ({
		virtualizer: track.virtualizer,
		viewport: {
			ref: track.layout.ref,
			padding: track.layout.geometry.padding,
			isReady,
			// Only suspend thumbnail snap while following an active detail scroll.
			// Virtualizer's idle transition restores snap without a separate timer.
			isSnapEnabled: kind === "detail" || !isThumbFollowing,
			onInteraction: () => controller.takeControl(kind),
			onScroll: () => {
				if (!isReady) return;
				controller.onScroll(kind);
				updateCurrentKey();
			},
		},
	});
	return {
		currentKey,
		detail: bind("detail", detail),
		thumb: bind("thumb", thumb),
		previous: () => controller.moveBy(-1),
		next: () => controller.moveBy(1),
		select: (messageKey: string) => {
			// Click-only activation has no preceding pointer/keyboard interaction.
			controller.takeControl("thumb");
			controller.select(messageKey);
			// Keep keyboard focus on the persistent viewport as items virtualize.
			thumb.layout.element?.focus({ preventScroll: true });
		},
	};
}
