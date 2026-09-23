import { useState } from "react";
import { ViewTransition } from "@/components/view-transition";
import ChatMediaCarouselSession from "./chat-media-carousel-session";
import { MediaCarouselPreviewProvider } from "./media-carousel-preview-provider";
import type { ChatMediaCarouselRootProps, ViewerState } from "./types";

export default function ChatMediaCarouselRoot(
	props: ChatMediaCarouselRootProps,
) {
	const [viewer, setViewer] = useState<ViewerState>({
		isOpen: false,
		transitionDisabled: false,
		targetKey: null,
		initialMessageAnchor: null,
		sessionKey: 0,
		previewData: { src: "" },
	});
	const key = viewer.targetKey;
	return (
		<ViewTransition.Root
			active={viewer.isOpen}
			disabled={viewer.transitionDisabled}
			from={key ? `chat:${key}` : null}
			to={key ? `viewer:${key}` : null}
			data={viewer.previewData}
			onStatusChange={(_status, { transition, reason }) => {
				if (reason !== "skipped") return;
				setViewer((current) =>
					current.isOpen === transition.active &&
					transition.to ===
						`${current.isOpen ? "viewer" : "chat"}:${current.targetKey}`
						? { ...current, transitionDisabled: true }
						: current,
				);
			}}
		>
			<MediaCarouselPreviewProvider>
				<ChatMediaCarouselSession
					{...props}
					viewer={viewer}
					setViewer={setViewer}
				/>
			</MediaCarouselPreviewProvider>
		</ViewTransition.Root>
	);
}
