import type { VirtualItem } from "@tanstack/react-virtual";
import { useViewTransition } from "@/components/view-transition";
import { useChatMediaCarouselContext } from "./chat-media-carousel/chat-media-carousel-context";
import MediaCarouselPreviewHost from "./chat-media-carousel/media-carousel-preview-host";
import { createMessageURI } from "./chat-media-carousel/utils";
import type { MessageListItem } from "./message-list-items";

export default function MessageListPreview({
	items,
	measurements,
}: {
	items: readonly MessageListItem[];
	measurements: readonly VirtualItem[];
}) {
	"use no memo";
	const { account } = useChatMediaCarouselContext();
	const { transitions } = useViewTransition();
	return transitions
		.filter((transition) => !transition.active)
		.map((transition) => {
			if (transition.to === null) return null;
			const index = items.findIndex(
				({ row }) =>
					transition.to ===
					`chat:${createMessageURI({ account, message: row.message })}`,
			);
			return (
				<MediaCarouselPreviewHost
					key={transition.id}
					targetKey={transition.to}
					style={{ top: measurements[index]?.start ?? 0 }}
				/>
			);
		});
}
