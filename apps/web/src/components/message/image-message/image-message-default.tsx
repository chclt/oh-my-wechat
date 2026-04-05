import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import { cn } from "@/lib/utils.ts";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import type { ImageMessageProps } from "./types.ts";

export function ImageMessageDefault({
	accountId,
	message,
	...props
}: ImageMessageProps) {
	const { ref: imageRef, inViewport } = useInViewport();

	const { data: image } = useQuery({
		...MessageImageQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
		}),
		enabled: inViewport,
	});

	return (
		<div
			className={cn("rounded-lg overflow-hidden")}
			onClick={() => {
				//
			}}
			{...props}
		>
			<AutoResolutionFallbackImage
				ref={imageRef}
				image={image}
				className={
					"max-w-[16em] max-h-128 min-w-32 min-h-16 object-contain bg-white"
				}
			/>
		</div>
	);
}
