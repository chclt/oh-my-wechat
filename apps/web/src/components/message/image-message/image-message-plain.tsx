import { ImageInfo } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import type { ComponentPropsWithRef } from "react";
import { useAccount } from "@/components/account-provider.tsx";
import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import type { ImageMessageProps } from "./types.ts";

interface ImageMessagePlainProps extends Omit<
	ComponentPropsWithRef<"img">,
	"src" | "srcSet" | "sizes"
> {
	message: ImageMessageProps["message"];
	sizes: (keyof ImageInfo)[];
}

export function ImageMessagePlain({
	message,
	sizes,
	ref,
	...props
}: ImageMessagePlainProps) {
	const { accountId } = useAccount();

	const { data: image } = useQuery({
		...MessageImageQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
			sizes: sizes,
		}),
	});

	return <AutoResolutionFallbackImage ref={ref} image={image} {...props} />;
}
