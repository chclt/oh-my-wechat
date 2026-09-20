import { useSyncExternalStore } from "react";
import type { ViewTransitionPreviewProps } from "./types";
import { ViewTransitionMotionPreview } from "./view-transition-motion-preview";
import { useViewTransitionController } from "./view-transition-root";

/** One stable portal per endpoint pair; other pairs never reuse its DOM or CSS history. */
export function ViewTransitionPreview<Data>(
	props: ViewTransitionPreviewProps<Data>,
) {
	const { store, getMotions } = useViewTransitionController();
	const motions = useSyncExternalStore(store.subscribe, getMotions, getMotions);
	return motions.map((motion) => (
		<ViewTransitionMotionPreview key={motion.key} {...props} motion={motion} />
	));
}
