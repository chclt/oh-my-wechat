import Image from "@/components/image.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import type { ImageMessageProps } from "./types.ts";
import { useAccount } from "@/components/account-provider.tsx";

export function ImageMessageAbstract({ message, ...props }: ImageMessageProps) {
	const { accountId } = useAccount();

	const { ref: imageRef, inViewport } = useInViewport();

	const { data: image } = useQuery({
		...MessageImageQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
			sizes: ["thumbnail"],
		}),
		enabled: inViewport,
	});

	return (
		<MessageInlineWrapper message={message} {...props}>
			<Image
				ref={imageRef}
				src={image?.thumbnail?.src}
				className="me-1 inline align-middle min-w-4 min-h-4 size-4 object-cover rounded-[3px]"
			/>
			[图片]
		</MessageInlineWrapper>
	);
}
