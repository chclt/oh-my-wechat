import { NoteMessageVideoQueryOptions } from "@/lib/fetchers/note-message";
import { cn } from "@/lib/utils";
import { MessageType } from "@/schema";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { videoMessageVariants } from "../message/video-message";
import { VideoMessageRecordType } from "@/schema/message-record.ts";

interface VideoRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: MessageType;
	record: VideoMessageRecordType;
	variant: "default" | string;
}

export default function VideoRecord({
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
	const { ref, inViewport } = useInViewport();

	// TODO
	const { data: video } = useQuery({
		...NoteMessageVideoQueryOptions({
			accountId: "",
			message: message,
			record: record,
		}),

		enabled: inViewport,
	});

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
				<video
					src={video?.src}
					poster={video?.poster?.src}
					controls
					className="w-full"
				/>
			</div>
		</div>
	);
}
