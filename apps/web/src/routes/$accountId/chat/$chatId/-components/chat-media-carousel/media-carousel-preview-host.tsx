import { type CSSProperties, useContext, useLayoutEffect } from "react";
import { useViewTransitionActions } from "@/components/view-transition";
import { MediaCarouselPreviewHostContext } from "./media-carousel-preview-context";
import classes from "./media-carousel-transition.module.css";

/** Mount in full-width scroll content, outside any narrower message column. */
export default function MediaCarouselPreviewHost({
	targetKey,
	style,
}: {
	targetKey: string;
	/** Unanimated positioning of the host, independent of the target's DOM. */
	style?: CSSProperties;
}) {
	const id = useContext(MediaCarouselPreviewHostContext);
	if (!id)
		throw new Error("Media preview hosts require MediaCarouselPreviewProvider");
	const { refresh } = useViewTransitionActions();
	useLayoutEffect(() => {
		// Virtual starts can change without a host resize or a mounted Target.
		refresh();
	}, [style, refresh]);
	return (
		<div className={classes.PreviewLayer}>
			<div
				id={`${id}:${targetKey}`}
				className={classes.PreviewAnchor}
				style={style}
			/>
		</div>
	);
}
