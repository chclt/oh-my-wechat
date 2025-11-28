import Link from "@/components/link.tsx";
import type { MessageType } from "@/schema";
import type React from "react";
import { MusicMessageRecordType } from "@/schema/message-record.ts";

interface MusicRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: MusicMessageRecordType;
	variant: "default" | string;
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
