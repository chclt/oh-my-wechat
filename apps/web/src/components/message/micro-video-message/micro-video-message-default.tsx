import { MessageVideoQueryOptions } from "@/lib/fetchers";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import type { MicroVideoMessageProps } from "./types.ts";

export function MicroVideoMessageDefault({
	accountId,
	message,
	...props
}: MicroVideoMessageProps) {
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
