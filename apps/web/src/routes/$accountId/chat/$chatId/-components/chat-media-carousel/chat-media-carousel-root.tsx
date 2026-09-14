import { MessageType } from "@repo/types";
import React, { useState } from "react";
import {
	ChatMediaCarouselContext,
	ChatMediaCarouselContextProps,
} from "./chat-media-carousel-context";

interface ChatMediaCarouselRootProps {
	account: { id: string };
	chat: { id: string };

	children: React.ReactNode;
}

export default function ChatMediaCarouselRoot({
	account,
	chat,
	children,
}: ChatMediaCarouselRootProps) {
	const [initialMessage, setInitialMessage] = useState<MessageType | null>(
		null,
	);
	const openChatMediaCarousel: ChatMediaCarouselContextProps["openChatMediaCarousel"] =
		setInitialMessage;
	const closeChatMediaCarousel = () => setInitialMessage(null);

	return (
		<ChatMediaCarouselContext
			value={{
				account,
				chat,
				initialMessage,
				closeChatMediaCarousel,
				openChatMediaCarousel,
			}}
		>
			{children}
		</ChatMediaCarouselContext>
	);
}
