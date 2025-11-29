import { RecordVideoQueryOptions } from "@/lib/fetchers/record.ts";
import { OpenMessageType, VideoNoteRecordType } from "@/schema";
import { NoteOpenMessageEntity } from "@/schema/open-message.ts";
import { useSuspenseQuery } from "@tanstack/react-query";

interface VideoNoteRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<NoteOpenMessageEntity>;
	recordEntity: VideoNoteRecordType;
}

export default function VideoNoteRecord({
	message,
	recordEntity,
	className,
	...props
}: VideoNoteRecordProps) {
	const { data: video } = useSuspenseQuery(
		RecordVideoQueryOptions({
			accountId: "",
			chat: { id: message.chat_id },
			message: message,
			record: recordEntity,
		}),
	);

	return (
		<div className={className} {...props}>
			<video
				src={video.src}
				poster={video.cover?.src}
				controls
				className="w-full"
			/>
		</div>
	);
}
