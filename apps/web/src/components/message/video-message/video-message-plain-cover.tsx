import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@/components/account-provider.tsx";
import Image from "@/components/image.tsx";
import { useResolveMessageFile } from "@/hooks/use-resolve-message-file.ts";
import { MessageVideoQueryOptions } from "@/lib/fetchers";
import type { VideoMessageProps } from "./types.ts";

interface VideoMessagePlainCoverProps extends Omit<
	React.ImgHTMLAttributes<HTMLImageElement>,
	"src" | "srcset" | "sizes"
> {
	message: VideoMessageProps["message"];
}

export function VideoMessagePlainCover({
	message,
	...props
}: VideoMessagePlainCoverProps) {
	const { accountId } = useAccount();

	const { ref: videoRef, inViewport } = useInViewport();

	const { data: video } = useQuery({
		enabled: inViewport,
		...MessageVideoQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			include: ["cover"],
			message,
		}),
	});

	const coverSrc = useResolveMessageFile(video?.cover?.uri);

	return (
		<Image
			ref={videoRef}
			src={coverSrc}
			width={video?.cover?.width}
			height={video?.cover?.height}
			{...props}
		/>
	);
}
