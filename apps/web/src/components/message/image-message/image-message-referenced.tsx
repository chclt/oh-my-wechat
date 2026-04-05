import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import User from "@/components/user.tsx";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import type { ImageMessageProps } from "./types.ts";
import { useAccount } from "@/components/account-provider.tsx";

export function ImageMessageReferenced({
	message,
	...props
}: ImageMessageProps) {
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
		<div {...props}>
			{message.from && (
				<>
					<User user={message.from} variant="inline" />
					<span>: </span>
				</>
			)}
			<AutoResolutionFallbackImage
				ref={imageRef}
				image={image}
				className="inline mx-[0.2em] align-top max-w-16 max-h-16 rounded overflow-hidden"
			/>
		</div>
	);
}
