import {
	NoteOpenMessageEntity,
	OpenMessageType,
	VideoNoteRecordType,
} from "@repo/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { RecordVideoQueryOptions } from "@/lib/fetchers/record.ts";
import { Route } from "@/routes/$accountId/route.tsx";

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
	const { accountId } = Route.useParams();

	const { data: video } = useSuspenseQuery(
		RecordVideoQueryOptions({
			account: { id: accountId },
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
