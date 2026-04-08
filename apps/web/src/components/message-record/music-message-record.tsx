import Link from "@/components/link.tsx";
import type { MessageType } from "@repo/types";
import { MusicMessageRecordType } from "@repo/types";
import type React from "react";

interface MusicRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: MusicMessageRecordType;
	variant: "default" | string;
}

export default function MusicMessageRecord({
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
