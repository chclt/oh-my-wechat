import { flushSync } from "react-dom";
import {
	readVisibleRect,
	toLocalRect,
	toViewportRect,
	retainRect,
	sameRect,
} from "./geometry";
import { observeTransitions } from "./observe-transitions";
import type { createPreviewTransport } from "./preview-transport";
import { Store, type Session } from "./store";
import type { EndReason, Endpoint, Rect, Status } from "./types";

export interface PreviewLayout {
	transport: ReturnType<typeof createPreviewTransport>;
	parking: HTMLElement;
	element: HTMLElement | null;
	container: () => HTMLElement | null;
	getEstimatedRect?: (parent: HTMLElement) => Rect | null;
}

export interface TransitionInput {
	active: boolean;
	from: Endpoint | null;
	to: Endpoint | null;
	data?: unknown;
}
/** One fixed endpoint pair owns its DOM and CSS history across direction changes. */
export class ViewTransitionMotion {
	readonly store = new Store<Session | null>(null);
	constructor(
		readonly key: number,
		readonly getTarget: (key: string) => HTMLElement | null,
	) {}
	onChange?: (status: Status, session: Session, reason?: EndReason) => void;
	private pending: (() => void) | null = null;
	private layout: PreviewLayout | null = null;
	private observer?: ReturnType<typeof observeTransitions>;
	private resize?: ResizeObserver;
	private observed = new Set<HTMLElement>();
	private endpointGeometry = new Map<Endpoint, Rect>();
	private targetEstimated = false;
	private queued = false;

	/** Only external layout inputs call this; geometry rendering does not feed back. */
	updatePreview(layout: PreviewLayout | null) {
		if (!layout) {
			this.layout?.transport.reset();
			this.layout?.transport.element.remove();
		}
		this.layout = layout;
		this.refresh();
	}

	get canInterrupt() {
		return this.layout?.transport.canMove ?? false;
	}
	get fromSize() {
		const session = this.store.getSnapshot();
		const from = session?.active ? session.from : session?.to;
		return (
			(from != null ? this.endpointGeometry.get(from) : null) ??
			session?.baseSize
		);
	}

	/** Capture source participation before React changes the DOM; never sample the moving preview. */
	prepare(input: TransitionInput, id: number) {
		const previous = this.store.getSnapshot();
		const from = input.active ? input.from : input.to;
		const to = input.active ? input.to : input.from;
		const sourceRect = this.measure(from);
		const skip =
			(!sourceRect && !previous?.geometry) ||
			(!!previous && !this.canInterrupt);
		this.observer?.beginUpdate();
		if (previous && !skip) this.layout!.transport.park(this.layout!.parking);
		const session: Session = {
			id,
			status: previous?.geometry ? "transitioning" : "preparing",
			active: input.active,
			from,
			to,
			// The whole content snapshot belongs to the motion, including its intrinsic size.
			data: previous ? previous.data : input.data,
			// Keep endpoints covered while a running preview changes direction.
			participants: previous?.participants ?? [],
			geometry: previous?.geometry ?? null,
			baseSize: previous?.baseSize ?? null,
		};
		return () => {
			this.pending = () => this.start(sourceRect);
			this.publish(session);
			if (skip) this.finish("skipped");
			else this.refresh();
		};
	}

	cancel = () => this.finish("cancelled");

	/** Coalesce committed layout, registration and size changes into one read. */
	refresh = () => {
		if (this.queued || !this.store.getSnapshot()) return;
		this.queued = true;
		queueMicrotask(() => {
			this.queued = false;
			this.updateLayout();
		});
	};

	private updateLayout() {
		const session = this.store.getSnapshot();
		if (!session) return;
		const container = this.layout?.container();
		if (!this.layout?.element || !container?.isConnected) {
			this.finish("skipped");
			return;
		}
		// Resolve and place after React commits both the preview and its host.
		this.layout.transport.place(container);
		if (!this.layout.element.getClientRects().length) {
			this.finish("skipped");
			return;
		}
		if (this.pending) {
			const start = this.pending;
			this.pending = null;
			start();
		} else {
			this.updateDestination(session);
		}
	}

	private start(sourceRect: Rect | null) {
		const session = this.store.getSnapshot()!;
		const frame = this.layout!.transport.element;
		const source = sourceRect
			? this.retainGeometry(session.from, toLocalRect(sourceRect, frame))
			: null;
		const destination = this.readDestination(session.to, true);
		if (!destination) {
			// A running preview losing its return target ends immediately. A new
			// transition without both endpoints leaves ordinary visibility to the caller.
			this.finish(session.geometry ? "cancelled" : "skipped");
			return;
		}
		const next: Session = {
			...session,
			participants: [source ? session.from : null, session.to].filter(
				(endpoint) => endpoint !== null,
			),
		};
		const element = this.layout!.element!;
		if (!session.geometry) {
			flushSync(() =>
				this.publish({ ...next, status: "starting", geometry: source! }),
			);
			if (this.store.getSnapshot()?.id !== session.id) return;
			element.ownerDocument
				.defaultView!.getComputedStyle(element)
				.getPropertyValue("translate");
		}
		this.animate({ ...next, geometry: destination });
	}

	/** A measured target can never fall back to an estimate. */
	private updateDestination(session: Session) {
		const destination = this.readDestination(session.to, this.targetEstimated);
		if (!destination) {
			this.finish("cancelled");
			return;
		}
		if (sameRect(session.geometry, destination)) return;
		this.animate({ ...session, geometry: destination });
	}

	private animate(session: Session) {
		this.observer ??= observeTransitions(this.layout!.element!, () =>
			this.finish("finished"),
		);
		this.observer.beginUpdate();
		flushSync(() => this.publish({ ...session, status: "transitioning" }));
		if (this.store.getSnapshot()?.id === session.id) this.observer?.endUpdate();
	}

	private readDestination(endpoint: Endpoint | null, allowEstimate: boolean) {
		const { getEstimatedRect } = this.layout!;
		const frame = this.layout!.transport.element;
		const container = frame.parentElement!;
		const target = endpoint === null ? null : this.getTarget(endpoint);
		this.observeLayout([container, ...(target ? [target] : [])]);
		const measured = this.measure(endpoint);
		const estimate =
			!measured && allowEstimate ? getEstimatedRect?.(container) : null;
		const rect =
			measured ?? (estimate ? toViewportRect(estimate, container) : null);
		this.targetEstimated = !measured;
		return rect
			? this.retainGeometry(endpoint, toLocalRect(rect, frame))
			: null;
	}

	private observeLayout(elements: HTMLElement[]) {
		this.resize ??= new ResizeObserver(this.refresh);
		const next = new Set(elements);
		this.observed.forEach((element) => {
			if (!next.has(element)) this.resize!.unobserve(element);
		});
		next.forEach((element) => {
			if (!this.observed.has(element)) this.resize!.observe(element);
		});
		this.observed = next;
	}

	private measure(endpoint: Endpoint | null) {
		if (endpoint === null) return null;
		const element = this.getTarget(endpoint);
		return element ? readVisibleRect(element) : null;
	}

	private retainGeometry(endpoint: Endpoint | null, rect: Rect): Rect {
		if (endpoint === null) return rect;
		const previous = this.endpointGeometry.get(endpoint);
		const geometry = previous ? retainRect(previous, rect) : rect;
		this.endpointGeometry.set(endpoint, geometry);
		return geometry;
	}

	private finish(reason: EndReason) {
		const session = this.store.getSnapshot();
		if (!session) return;
		this.observer?.dispose();
		this.observer = undefined;
		this.resize?.disconnect();
		this.observed.clear();
		this.endpointGeometry.clear();
		this.pending = null;
		this.store.set(null);
		this.onChange?.("idle", session, reason);
	}

	private publish(session: Session) {
		const previous = this.store.getSnapshot();
		const baseSize = previous?.baseSize ?? session.geometry;
		this.store.set({ ...session, baseSize });
		if (
			session.status !== previous?.status ||
			session.id !== previous?.id ||
			session.participants !== previous?.participants
		)
			this.onChange?.(session.status, session);
	}
}
