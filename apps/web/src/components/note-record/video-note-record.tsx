import {
	NoteOpenMessageEntity,
	OpenMessageType,
	VideoNoteRecordType,
} from "@repo/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useResolveMessageFile } from "@/hooks/use-resolve-message-file.ts";
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

	const videoSrc = useResolveMessageFile(video?.uri);
	const coverSrc = useResolveMessageFile(video?.cover?.uri);

	return (
		<div className={className} {...props}>
			<video src={videoSrc} poster={coverSrc} controls className="w-full" />
		</div>
	);
}
