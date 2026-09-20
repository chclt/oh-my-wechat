import type { Dialog } from "@base-ui/react";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useMemo,
	useRef,
} from "react";
import { useViewTransition } from "@/components/view-transition";
import type { CarouselScrollController } from "./carousel-scroll-controller";
import {
	ChatMediaCarouselContext,
	ChatMediaCarouselTriggerContext,
} from "./chat-media-carousel-context";
import type {
	CarouselMessageAnchor,
	ChatMediaCarouselRootProps,
	ViewerState,
} from "./types";
import { createMessageURI, readMediaPreview } from "./utils";

export default function ChatMediaCarouselSession({
	account,
	chat,
	children,
	viewer,
	setViewer,
}: ChatMediaCarouselRootProps & {
	viewer: ViewerState;
	setViewer: Dispatch<SetStateAction<ViewerState>>;
}) {
	const carouselRef = useRef<CarouselScrollController | null>(null);
	const { status, canTransition, getTarget } = useViewTransition();
	const transitioning = status !== "idle";

	const openChatMediaCarousel = useCallback(
		(messageAnchor: CarouselMessageAnchor) => {
			const key = createMessageURI({
				account,
				message: { chat_id: chat.id, local_id: messageAnchor.local_id },
			});
			if (!canTransition(`chat:${key}`, `viewer:${key}`)) return;
			const previewData = readMediaPreview(getTarget(`chat:${key}`));
			setViewer((current) => {
				const sameImage = current.targetKey === key;
				if (current.isOpen && sameImage) return current;
				const reuse = sameImage && transitioning;
				return {
					isOpen: true,
					transitionDisabled: false,
					targetKey: key,
					initialMessageAnchor: reuse
						? current.initialMessageAnchor
						: messageAnchor,
					sessionKey: reuse ? current.sessionKey : current.sessionKey + 1,
					previewData:
						previewData ?? (reuse ? current.previewData : { src: "" }),
				};
			});
		},
		[account, chat.id, canTransition, getTarget, transitioning, setViewer],
	);
	const onCurrentKeyChange = useCallback(
		(targetKey: string) =>
			setViewer((current) =>
				!current.isOpen || current.targetKey === targetKey
					? current
					: { ...current, targetKey, previewData: { src: "" } },
			),
		[setViewer],
	);

	const trigger = useMemo(
		() => ({ account, openChatMediaCarousel }),
		[account.id, openChatMediaCarousel],
	);
	const onOpenChange: Dialog.Root.Props["onOpenChange"] = (open, details) => {
		if (open) return;
		// Reverse the visible preview first. Otherwise require a centered detail;
		// pagination anchoring can report scrolling without moving the visible image.
		const transitionDisabled =
			!transitioning && !carouselRef.current?.isDetailSnapped;
		const key = viewer.targetKey;
		if (
			!transitionDisabled &&
			key &&
			!canTransition(`chat:${key}`, `viewer:${key}`)
		)
			return details.cancel();
		const previewData =
			!transitionDisabled && key
				? readMediaPreview(getTarget(`viewer:${key}`), getTarget(`chat:${key}`))
				: null;
		setViewer((current) => ({
			...current,
			isOpen: false,
			transitionDisabled,
			previewData: previewData ?? current.previewData,
		}));
	};

	return (
		<ChatMediaCarouselContext
			value={{
				account,
				chat,
				isOpen: viewer.isOpen,
				transitionDisabled: viewer.transitionDisabled,
				initialMessageAnchor: viewer.initialMessageAnchor,
				currentMessageKey: viewer.isOpen ? viewer.targetKey : null,
				sessionKey: viewer.sessionKey,
				carouselRef,
				onOpenChange,
				onCurrentKeyChange,
			}}
		>
			<ChatMediaCarouselTriggerContext value={trigger}>
				{children}
			</ChatMediaCarouselTriggerContext>
		</ChatMediaCarouselContext>
	);
}
