import type { NoteMessageEntity } from "@/components/message/app-message/note-message.tsx";
import { NoteMessageVideoQueryOptions } from "@/lib/fetchers/note-message";
import { AppMessageType, RecordTypeEnum } from "@/schema";
import { useSuspenseQuery } from "@tanstack/react-query";

export interface VideoNoteRecordEntity {
	"@_datatype": RecordTypeEnum.VIDEO;
	"@_dataid": string;
	"@_htmlid": string;

	datafmt: string; // mp4
	duration: number; // 秒

	datasize: number;
	cdndataurl: string;
	cdnthumbkey: string;
	fullmd5: string;
	head256md5: string;

	thumbsize: number;
	thumbfullmd5: string;
	thumbhead256md5: string;
	cdndatakey: string;
}

interface VideoNoteRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: AppMessageType<NoteMessageEntity>;
	recordEntity: VideoNoteRecordEntity;
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
