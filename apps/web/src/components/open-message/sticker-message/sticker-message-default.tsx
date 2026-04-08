import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@/components/account-provider.tsx";
import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import type { StickerMessageProps } from "./types";

export function StickerMessageDefault({
	message,
	...props
}: StickerMessageProps) {
	const { accountId } = useAccount();

	const { ref: imageRef, inViewport } = useInViewport();

	const { data: image } = useQuery({
		...MessageImageQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
			domain: "opendata",
		}),
		enabled: inViewport,
	});
	return (
		<div {...props}>
			<AutoResolutionFallbackImage
				ref={imageRef}
				image={image}
				className="max-w-32"
			/>
		</div>
	);
}
