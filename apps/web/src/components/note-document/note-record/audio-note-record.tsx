import type { NoteMessageEntity } from "@/components/message/app-message/note-message";
import { cn } from "@/lib/utils";
import { AppMessageType, AudioNoteRecordType } from "@/schema";

interface AudioNoteRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: AppMessageType<NoteMessageEntity>;
	recordEntity: AudioNoteRecordType;
}

export default function AudioNoteRecord({
	message,
	recordEntity,
	className,
	...props
}: AudioNoteRecordProps) {
	// const { data: file } = useSuspenseQuery(
	// 	NoteMessageFileQueryOptions({
	// 		message,
	// 		record: recordEntity,
	// 	}),
	// );

	return (
		<div className={cn("p-2.5 bg-muted rounded-xs", className)} {...props}>
			<span className="text-muted-foreground ">暂不支持的音频文件</span>
		</div>
	);
}
