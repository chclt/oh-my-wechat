import { useRender } from "@base-ui/react/use-render";
import {
	type CSSProperties,
	useLayoutEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import type { ViewTransitionMotion } from "./motion";
import { createPreviewTransport } from "./preview-transport";
import type { Status, ViewTransitionPreviewProps } from "./types";

export function ViewTransitionMotionPreview<Data>({
	motion,
	children,
	container,
	render,
	ref,
	style,
	getEstimatedRect,
	...props
}: ViewTransitionPreviewProps<Data> & { motion: ViewTransitionMotion }) {
	const { store } = motion;
	const session = useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getSnapshot,
	);
	const status: Status = session?.status ?? "idle";
	const parking = useRef<HTMLDivElement>(null);
	const [transport] = useState(() => createPreviewTransport(document));
	useLayoutEffect(() => () => motion.updatePreview(null), [motion]);
	const context = session
		? {
				active: session.active,
				from: session.from,
				to: session.to,
				data: session.data as Data,
				status,
			}
		: null;
	const elementRef = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		motion.updatePreview({
			transport,
			parking: parking.current!,
			element: elementRef.current,
			container: () =>
				typeof container === "function"
					? context && container(context)
					: container,
			getEstimatedRect: context
				? (parent) => getEstimatedRect?.(parent, context) ?? null
				: undefined,
		});
		// Geometry changes only render CSS variables; they are not layout inputs.
	}, [motion, transport, container, getEstimatedRect, session?.id, status]);
	const geometry = session?.geometry;
	const baseSize = session?.baseSize;
	const fromSize = motion.fromSize;
	const preview = useRender({
		enabled: !!session,
		render,
		ref: [elementRef, ref ?? null],
		state: {
			status,
			active: session?.active ?? false,
			startingStyle: status === "preparing" || status === "starting",
		},
		stateAttributesMapping: {
			active: (value) => (value ? { "data-active": "" } : null),
			startingStyle: (value) => (value ? { "data-starting-style": "" } : null),
		},
		props: {
			...props,
			inert: true,
			"aria-hidden": true,
			style: {
				...style,
				"--vt-x": `${geometry?.x ?? 0}px`,
				"--vt-y": `${geometry?.y ?? 0}px`,
				"--vt-base-width": `${baseSize?.width ?? 0}px`,
				"--vt-base-height": `${baseSize?.height ?? 0}px`,
				"--vt-scale-x":
					geometry && baseSize ? geometry.width / baseSize.width : 1,
				"--vt-scale-y":
					geometry && baseSize ? geometry.height / baseSize.height : 1,
				"--vt-from-scale-x":
					fromSize && baseSize ? fromSize.width / baseSize.width : 1,
				"--vt-from-scale-y":
					fromSize && baseSize ? fromSize.height / baseSize.height : 1,
			} as CSSProperties,
			children: context ? children(context) : null,
		},
	});
	return (
		<>
			<div
				ref={parking}
				data-view-transition-parking=""
				aria-hidden="true"
				inert
				style={{
					position: "fixed",
					left: 0,
					top: 0,
					width: 0,
					height: 0,
					pointerEvents: "none",
				}}
			/>
			{createPortal(preview, transport.element)}
		</>
	);
}
