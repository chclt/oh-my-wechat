import type { VirtualItem } from "@tanstack/react-virtual";
import { useViewTransition } from "@/components/view-transition";
import MediaCarouselPreviewHost from "./media-carousel-preview-host";

/** Preview hosts share the virtual row's origin without depending on its DOM. */
export default function DetailCarouselPreview({
	items,
}: {
	items: readonly VirtualItem[];
}) {
	const { transitions } = useViewTransition();
	return transitions
		.filter((transition) => transition.active)
		.map((transition) => {
			if (transition.to === null) return null;
			const item = items.find((item) => transition.to === `viewer:${item.key}`);
			return (
				<MediaCarouselPreviewHost
					key={transition.id}
					targetKey={transition.to}
					style={{ left: item?.start ?? 0, width: item?.size ?? "100cqw" }}
				/>
			);
		});
}
