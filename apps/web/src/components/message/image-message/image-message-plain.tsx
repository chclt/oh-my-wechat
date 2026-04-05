import { useInViewport } from "@mantine/hooks";
import { ImageInfo } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import { ImgHTMLAttributes } from "react";
import { useAccount } from "@/components/account-provider.tsx";
import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import type { ImageMessageProps } from "./types.ts";

interface ImageMessagePlainProps extends Omit<
	ImgHTMLAttributes<HTMLImageElement>,
	"src" | "srcset" | "sizes"
> {
	message: ImageMessageProps["message"];
	sizes: (keyof ImageInfo)[];
}

export function ImageMessagePlain({
	message,
	sizes,
	...props
}: ImageMessagePlainProps) {
	const { accountId } = useAccount();

	const { ref: imageRef, inViewport } = useInViewport();

	const { data: image } = useQuery({
		...MessageImageQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
			sizes: sizes,
		}),
		enabled: true || inViewport,
	});

	return (
		<AutoResolutionFallbackImage ref={imageRef} image={image} {...props} />
	);
}
