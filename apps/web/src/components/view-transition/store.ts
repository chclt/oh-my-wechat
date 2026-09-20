import type { Rect, Status, TransitionState } from "./types";

type Size = Pick<Rect, "width" | "height">;

export interface Session extends TransitionState {
	status: Exclude<Status, "idle">;
	geometry: Rect | null;
	baseSize: Size | null;
}
/** React's observable snapshot. Lifecycle decisions belong to the controller. */
export class Store<Value> {
	constructor(private snapshot: Value) {}
	private listeners = new Set<() => void>();
	getSnapshot = () => this.snapshot;
	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};
	set(snapshot: Value) {
		this.snapshot = snapshot;
		this.listeners.forEach((listener) => listener());
	}
}
