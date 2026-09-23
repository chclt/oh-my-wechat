import type { Dialog } from "@base-ui/react";
import { createContext, type RefObject, useContext } from "react";
import type { CarouselScrollController } from "./carousel-scroll-controller";
import type { CarouselMessageAnchor } from "./types";

interface ChatMediaCarouselContextApi {
	account: { id: string };
	openChatMediaCarousel: (messageAnchor: CarouselMessageAnchor) => void;
}

export const ChatMediaCarouselTriggerContext =
	createContext<ChatMediaCarouselContextApi | null>(null);

export interface ChatMediaCarouselContextProps {
	account: { id: string };
	chat: { id: string };

	initialMessageAnchor: CarouselMessageAnchor | null;
	currentMessageKey: string | null;
	isOpen: boolean;
	transitionDisabled: boolean;
	sessionKey: number;
	carouselRef: RefObject<CarouselScrollController | null>;
	onOpenChange: Dialog.Root.Props["onOpenChange"];
	onCurrentKeyChange: (key: string) => void;
}

// Only the presented message window registers chat-side animation targets.
export const ChatMediaCarouselSourceEnabledContext = createContext(true);

export const ChatMediaCarouselContext =
	createContext<ChatMediaCarouselContextProps | null>(null);

export function useChatMediaCarouselContext() {
	const context = useContext(ChatMediaCarouselContext);
	if (!context) {
		throw new Error(
			"useChatMediaCarouselContext must be used within a ChatMediaCarouselContext",
		);
	}
	return context;
}
