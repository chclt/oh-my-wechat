import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@/components/account-provider.tsx";
import { useResolveMessageFile } from "@/hooks/use-resolve-message-file.ts";
import { MessageVideoQueryOptions } from "@/lib/fetchers";
import type { VideoMessageProps } from "./types.ts";

interface VideoMessagePlainProps extends Omit<
	React.VideoHTMLAttributes<HTMLVideoElement>,
	"src" | "poster"
> {
	message: VideoMessageProps["message"];
}

export function VideoMessagePlain({
	message,
	...props
}: VideoMessagePlainProps) {
	const { accountId } = useAccount();

	const { ref: videoRef, inViewport } = useInViewport();

	const { data: video } = useQuery({
		enabled: inViewport,
		...MessageVideoQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
		}),
	});

	const videoSrc = useResolveMessageFile(video?.uri);
	const coverSrc = useResolveMessageFile(video?.cover?.uri);

	return (
		<video
			ref={videoRef}
			src={videoSrc}
			poster={coverSrc}
			controls
			// width={result?.[0]?.width}
			// height={result?.[0]?.height}
			{...props}
		/>
	);
}
