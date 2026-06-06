import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@/components/account-provider.tsx";
import Image from "@/components/image.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper";
import { useResolveMessageFile } from "@/hooks/use-resolve-message-file.ts";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import type { ImageMessageProps } from "./types.ts";

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

	const thumbnailSrc = useResolveMessageFile(image?.thumbnail?.uri);

	return (
		<MessageInlineWrapper message={message} {...props}>
			<Image
				ref={imageRef}
				src={thumbnailSrc}
				className="me-1 inline align-middle min-w-4 min-h-4 size-4 object-cover rounded-[3px]"
			/>
			[图片]
		</MessageInlineWrapper>
	);
}
