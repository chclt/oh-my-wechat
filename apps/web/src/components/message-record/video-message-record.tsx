import { useInViewport } from "@mantine/hooks";
import { MessageType, VideoMessageRecordType } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import { useResolveMessageFile } from "@/hooks/use-resolve-message-file.ts";
import { RecordVideoQueryOptions } from "@/lib/fetchers/record.ts";
import { cn } from "@/lib/utils";
import { Route } from "@/routes/$accountId/route.tsx";
import { videoMessageVariants } from "../message/video-message";

interface VideoRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: MessageType;
	record: VideoMessageRecordType;
	variant: "default" | string;
}

export default function VideoMessageRecord({
	message,
	record,
	variant = "default",
	...props
}: VideoRecordProps) {
	if (variant === "default") {
		return <VideoRecordDefault message={message} record={record} {...props} />;
	}
	return <p className="inline">视频</p>;
}

function VideoRecordDefault({
	message,
	record,
	className,
	...props
}: Omit<VideoRecordProps, "variant">) {
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
		<div
			ref={ref}
			className={cn(
				videoMessageVariants({
					variant: "default",
					direction: message.direction,
					className,
				}),
			)}
			{...props}
		>
			<div className="relative">
				<video src={videoSrc} poster={coverSrc} controls className="w-full" />
			</div>
		</div>
	);
}
