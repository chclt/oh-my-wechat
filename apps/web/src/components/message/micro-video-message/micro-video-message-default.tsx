import { MessageVideoQueryOptions } from "@/lib/fetchers";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import type { MicroVideoMessageProps } from "./types.ts";
import { useAccount } from "@/components/account-provider.tsx";

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

	return (
		<div {...props}>
			<video
				ref={videoRef}
				src={video?.src}
				poster={video?.cover?.src}
				controls
			/>
		</div>
	);
}
