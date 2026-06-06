import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@/components/account-provider.tsx";
import { useResolveMessageFile } from "@/hooks/use-resolve-message-file.ts";
import { MessageVideoQueryOptions } from "@/lib/fetchers";
import type { MicroVideoMessageProps } from "./types.ts";

export function MicroVideoMessageDefault({
	message,
	...props
}: MicroVideoMessageProps) {
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
		<div {...props}>
			<video ref={videoRef} src={videoSrc} poster={coverSrc} controls />
		</div>
	);
}
