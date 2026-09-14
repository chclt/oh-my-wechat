import { getPositionOffset, readCarouselPosition } from "./carousel-position";
import type { CarouselGeometry, CarouselKind, CarouselPosition } from "./types";

interface ScrollViewport {
	geometry: CarouselGeometry;
	getOffset: () => number;
	getViewportSize: () => number;
	scrollTo: (offset: number) => void;
}

type Viewports = Record<CarouselKind, ScrollViewport>;
const OFFSET_TOLERANCE = 0.5;

/**
 * Owns the shared position; viewports are projections of it. Only the viewport
 * receiving user input may publish a new position. The follower's scroll events
 * cannot feed back, regardless of whether they came from native snap or code.
 */
export class CarouselScrollController {
	private position: CarouselPosition;
	private source: CarouselKind = "detail";
	private keys: readonly string[] = [];
	private indexes = new Map<string, number>();
	private viewports: Viewports | null = null;

	constructor(initialMessageKey: string) {
		this.position = { messageKey: initialMessageKey, progress: 0 };
	}

	get messageKey() {
		return this.position.messageKey;
	}

	/** Called after DOM layout has committed, before browser scroll events. */
	update(keys: readonly string[], viewports: Viewports) {
		this.keys = keys;
		this.indexes = new Map(keys.map((key, index) => [key, index]));
		this.viewports = viewports;
		this.restore("detail");
		this.restore("thumb");
	}

	takeControl(kind: CarouselKind) {
		// Native snap may have accepted a different position from the one written.
		// Start a new gesture from what this viewport actually displays.
		if (kind !== this.source)
			this.position = this.readPosition(kind) ?? this.position;
		this.source = kind;
	}

	onScroll(kind: CarouselKind) {
		if (kind !== this.source) return;
		const position = this.readPosition(kind);
		if (!position) return;
		this.position = position;
		this.syncFollower();
	}

	syncFollower() {
		this.restore(this.source === "detail" ? "thumb" : "detail");
	}

	moveBy(delta: number) {
		const index = this.indexes.get(this.position.messageKey);
		if (index === undefined) return;
		const nextKey = this.keys[index + delta];
		if (!nextKey) return;
		this.position = { messageKey: nextKey, progress: 0 };
		this.restore("detail");
		this.restore("thumb");
	}

	private readPosition(kind: CarouselKind) {
		const viewport = this.viewports?.[kind];
		if (!viewport) return null;
		// Native re-snap can precede ResizeObserver/React's new geometry. Keep
		// the semantic position until update() can restore it in the new layout.
		if (
			Math.abs(viewport.getViewportSize() - viewport.geometry.viewportSize) >
			OFFSET_TOLERANCE
		)
			return null;
		return readCarouselPosition(
			viewport.getOffset(),
			this.keys,
			viewport.geometry,
		);
	}

	private restore(kind: CarouselKind) {
		const viewport = this.viewports?.[kind];
		if (!viewport) return;
		const offset = getPositionOffset(
			this.position,
			this.indexes,
			viewport.geometry,
		);
		if (
			offset === null ||
			Math.abs(viewport.getOffset() - offset) <= OFFSET_TOLERANCE
		)
			return;
		viewport.scrollTo(offset);
	}
}
