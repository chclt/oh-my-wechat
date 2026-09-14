import { MessageType } from "@repo/types";
import { createContext, useContext } from "react";

interface ChatMediaCarouselContextApi {
	openChatMediaCarousel: (message: MessageType) => void;
}

export interface ChatMediaCarouselContextProps extends ChatMediaCarouselContextApi {
	account: { id: string };
	chat: { id: string };

	initialMessage: MessageType | null;
	closeChatMediaCarousel: () => void;
}

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
