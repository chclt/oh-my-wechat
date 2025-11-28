import type { NoteMessageEntity } from "@/components/message/app-message/note-message.tsx";
import { NoteMessageVideoQueryOptions } from "@/lib/fetchers/note-message.ts";
import { AppMessageType, VideoNoteRecordType } from "@/schema";
import { useSuspenseQuery } from "@tanstack/react-query";

interface VideoNoteRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: AppMessageType<NoteMessageEntity>;
	recordEntity: VideoNoteRecordType;
}

export default function VideoNoteRecord({
	message,
	recordEntity,
	className,
	...props
}: VideoNoteRecordProps) {
	const { data: video } = useSuspenseQuery(
		NoteMessageVideoQueryOptions({
			accountId: "",
			message: message,
			record: recordEntity,
		}),
	);

	return (
		<div className={className} {...props}>
			<video
				src={video.src}
				poster={video.poster?.src}
				controls
				className="w-full"
			/>
		</div>
	);
}
