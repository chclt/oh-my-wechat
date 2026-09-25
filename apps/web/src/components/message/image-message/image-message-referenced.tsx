import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { useAccount } from "@/components/account-provider.tsx";
import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import User from "@/components/user.tsx";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import type { ImageMessageProps } from "./types.ts";

export function ImageMessageReferenced({
	message,
	...props
}: ImageMessageProps) {
	const { accountId } = useAccount();

	const width = message.message_entity.msg.img["@_cdnthumbwidth"];
	const height = message.message_entity.msg.img["@_cdnthumbheight"];
	const thumbnailDimensions =
		width && height && width !== "0" && height !== "0"
			? { width, height }
			: undefined;

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
		<span {...props}>
			{message.from && (
				<>
					<User user={message.from} variant="inline" />
					<span>: </span>
				</>
			)}
			<AutoResolutionFallbackImage
				ref={imageRef}
				image={image}
				{...thumbnailDimensions}
				className="inline mx-[0.2em] align-top max-w-16 max-h-16 rounded overflow-hidden"
			/>
		</span>
	);
}
