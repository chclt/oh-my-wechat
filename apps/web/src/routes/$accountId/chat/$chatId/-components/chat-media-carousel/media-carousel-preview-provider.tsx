import { type ReactNode, useId } from "react";
import { ViewTransition } from "@/components/view-transition";
import { estimateDetailImageRect } from "./media-carousel-layout";
import {
	MediaCarouselPreviewHostContext,
	type MediaPreviewData,
} from "./media-carousel-preview-context";
import classes from "./media-carousel-transition.module.css";

/** Resolve each motion's destination independently of the currently opened image. */
export function MediaCarouselPreviewProvider({
	children,
}: {
	children: ReactNode;
}) {
	const id = useId();
	return (
		<MediaCarouselPreviewHostContext value={id}>
			{children}
			<ViewTransition.Preview<MediaPreviewData>
				container={({ to }) =>
					to === null ? null : document.getElementById(`${id}:${to}`)
				}
				className={classes.Preview}
				getEstimatedRect={(parent, { active, data }) =>
					active ? estimateDetailImageRect(parent, data) : null
				}
			>
				{({ data }) =>
					data.src ? (
						<img
							src={data.src}
							alt=""
							draggable={false}
							data-blurred-background={
								data.hasBlurredBackground ? "" : undefined
							}
						/>
					) : null
				}
			</ViewTransition.Preview>
		</MediaCarouselPreviewHostContext>
	);
}
