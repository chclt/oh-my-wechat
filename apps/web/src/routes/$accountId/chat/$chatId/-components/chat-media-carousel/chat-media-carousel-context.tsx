import { MessageType } from "@repo/types";
import {
	createContext,
	Dispatch,
	RefObject,
	SetStateAction,
	useContext,
} from "react";

interface ChatMediaCarouselContextApi {
	openChatMediaCarousel: (message: MessageType) => void;
}

export interface ChatMediaCarouselContextProps extends ChatMediaCarouselContextApi {
	account: { id: string };
	chat: { id: string };

	isDialogOpen: boolean;
	setIsDialogOpen: Dispatch<SetStateAction<boolean>>;

	initialMessageRef: RefObject<MessageType | null>;
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
