import Link from "@/components/link.tsx";
import type { MessageType, RecordTypeEnum } from "@/schema";
import type { RecordType } from "./record";

interface MusicRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: MusicRecordEntity;
	variant: "default" | string;
}

export interface MusicRecordEntity extends RecordType {
	"@_datatype": RecordTypeEnum.MUSIC;
	datatitle: string;
	streamweburl: string;
	streamdataurl: string;
}

export default function MusicRecord({
	message,
	record,

	...props
}: MusicRecordProps) {
	return (
		<div {...props}>
			<Link href={record.streamweburl}>[音乐] {record.datatitle}</Link>
		</div>
	);
}
