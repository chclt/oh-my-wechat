import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useCallback, useSyncExternalStore } from "react";
import { useViewTransitionController } from "./view-transition-root";

export interface ViewTransitionTargetState {
	transitionSource: boolean;
	transitionTarget: boolean;
	transitionCovered: boolean;
	startingStyle: boolean;
}

export interface ViewTransitionTargetProps extends useRender.ComponentProps<
	"div",
	ViewTransitionTargetState
> {
	targetKey: string;
	/** Whether the content can participate; a placeholder may already have geometry. */
	isReady?: (element: HTMLElement) => boolean;
}

enum TargetFlags {
	Source = 1,
	Destination = 2,
	StartingStyle = 4,
}

export function ViewTransitionTarget({
	targetKey,
	isReady,
	render,
	ref,
	...props
}: ViewTransitionTargetProps) {
	const controller = useViewTransitionController();
	const { store } = controller;
	// A primitive snapshot lets React skip updates for unrelated targets.
	const getFlags = useCallback(() => {
		let flags = 0;
		for (const session of store.getSnapshot().transitions) {
			if (!session.participants.includes(targetKey)) continue;
			if (session.from === targetKey) flags |= TargetFlags.Source;
			if (session.to === targetKey) flags |= TargetFlags.Destination;
			if (session.status === "starting") flags |= TargetFlags.StartingStyle;
		}
		return flags;
	}, [store, targetKey]);
	const flags = useSyncExternalStore(store.subscribe, getFlags, getFlags);
	const register = useCallback(
		(element: HTMLElement | null) => {
			if (element)
				return controller.registerTarget(targetKey, element, isReady);
		},
		[controller, targetKey, isReady],
	);
	return useRender({
		render,
		ref: [register, ref ?? null],
		// Loading can change content readiness without changing its reserved size.
		props: mergeProps<"div">({ onLoad: controller.refresh }, props),
		stateAttributesMapping: {
			transitionSource: (value) =>
				value ? { "data-transition-source": "" } : null,
			transitionTarget: (value) =>
				value ? { "data-transition-target": "" } : null,
			transitionCovered: (value) =>
				value ? { "data-transition-covered": "" } : null,
			startingStyle: (value) => (value ? { "data-starting-style": "" } : null),
		},
		state: {
			transitionSource: !!(flags & TargetFlags.Source),
			transitionTarget: !!(flags & TargetFlags.Destination),
			transitionCovered: flags !== 0,
			startingStyle: !!(flags & TargetFlags.StartingStyle),
		},
	});
}
