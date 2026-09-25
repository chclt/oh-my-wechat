import type { MessageType } from "@repo/types";
import { MusicMessageRecordType } from "@repo/types";
import type React from "react";
import Link from "@/components/link.tsx";

interface MusicRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: MusicMessageRecordType;
	variant: "default" | string;
}

export default function MusicMessageRecord({
	message,
	record,
	variant = "default",
	...props
}: MusicRecordProps) {
	const Container = variant === "default" ? "div" : "span";
	return (
		<Container {...props}>
			<Link href={record.streamweburl}>[音乐] {record.datatitle}</Link>
		</Container>
	);
}
