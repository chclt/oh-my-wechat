import type { useRender } from "@base-ui/react/use-render";
import type { ReactNode } from "react";

export interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export type Endpoint = string;
export type Status = "idle" | "preparing" | "starting" | "transitioning";
export type EndReason = "finished" | "cancelled" | "skipped";

export interface Transition<Data = unknown> {
	active: boolean;
	from: Endpoint | null;
	to: Endpoint | null;
	data: Data;
}

/** Shared lifecycle and participation; each Preview owns its live geometry. */
export interface TransitionState extends Transition {
	id: number;
	status: Status;
	participants: readonly Endpoint[];
}

export interface ChangeDetails {
	transition: Transition;
	reason?: EndReason;
}

export interface ViewTransitionPreviewState {
	active: boolean;
	startingStyle: boolean;
	status: Status;
}

export interface ViewTransitionPreviewContext<Data> extends Transition<Data> {
	status: Status;
}

export interface ViewTransitionPreviewProps<Data = unknown> extends Omit<
	useRender.ComponentProps<"div", ViewTransitionPreviewState>,
	"children"
> {
	/** Connected, positioned host chosen by the caller. Keep Preview itself mounted. */
	container:
		| HTMLElement
		| null
		| ((context: ViewTransitionPreviewContext<Data>) => HTMLElement | null);
	children: (context: ViewTransitionPreviewContext<Data>) => ReactNode;
	/** Estimated destination in the positioned parent's content coordinates. */
	getEstimatedRect?: (
		parent: HTMLElement,
		context: ViewTransitionPreviewContext<Data>,
	) => Rect | null;
}
