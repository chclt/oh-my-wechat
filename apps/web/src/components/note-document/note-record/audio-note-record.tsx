import type { NoteMessageEntity } from "@/components/message/app-message/note-message";
import { cn } from "@/lib/utils";
import { AppMessageType, RecordTypeEnum } from "@/schema";

export interface AudioNoteRecordEntity {
	"@_datatype": RecordTypeEnum.AUDIO;
	"@_dataid": string;
	"@_htmlid": string;

	cdndataurl: string;
	cdndatakey: string;
	fullmd5: string;
	datafmt: "speex"; // 暂时只见过 speex 格式
	datasize: number;
	duration: number;
	head256md5: string;
}

interface AudioNoteRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: AppMessageType<NoteMessageEntity>;
	recordEntity: AudioNoteRecordEntity;
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
