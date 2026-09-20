import { useInViewport } from "@mantine/hooks";
import type { MessageType, VideoMessageRecordType } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import type { HTMLAttributes } from "react";
import { useResolveMessageFile } from "@/hooks/use-resolve-message-file.ts";
import { RecordVideoQueryOptions } from "@/lib/fetchers/record.ts";
import { cn } from "@/lib/utils";
import { Route } from "@/routes/$accountId/route.tsx";
import { videoMessageClassName } from "../message/video-message";

export interface VideoMessageRecordDefaultProps extends HTMLAttributes<HTMLElement> {
	message: MessageType;
	record: VideoMessageRecordType;
}

export function VideoMessageRecordDefault({
	message,
	record,
	className,
	...props
}: VideoMessageRecordDefaultProps) {
	const { accountId } = Route.useParams();

	const { ref, inViewport } = useInViewport();

	const { data: video } = useQuery({
		...RecordVideoQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message: message,
			record: record,
		}),

		enabled: inViewport,
	});

	const videoSrc = useResolveMessageFile(video?.uri);
	const coverSrc = useResolveMessageFile(video?.cover?.uri);

	return (
		<div ref={ref} className={cn(videoMessageClassName, className)} {...props}>
			<div className="relative">
				<video src={videoSrc} poster={coverSrc} controls className="w-full" />
			</div>
		</div>
	);
}
