import { MessageType } from "@repo/types";
import React, { useRef, useState } from "react";
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
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const initialMessageRef = useRef<MessageType | null>(null);

	const openChatMediaCarousel: ChatMediaCarouselContextProps["openChatMediaCarousel"] =
		(message) => {
			initialMessageRef.current = message;
			setIsDialogOpen(true);
		};

	return (
		<ChatMediaCarouselContext
			value={{
				account,
				chat,
				isDialogOpen,
				setIsDialogOpen,
				initialMessageRef,
				openChatMediaCarousel,
			}}
		>
			{children}
		</ChatMediaCarouselContext>
	);
}
