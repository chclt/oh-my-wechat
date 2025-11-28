import type { MessageType } from "@/schema";
import type React from "react";
import { AttachMessageRecordType } from "@/schema/message-record.ts";

interface AttatchRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: AttachMessageRecordType;
	variant: "default" | string;
}

export default function AttatchRecord({
	message,
	record,
	variant = "default",
	className,
	...props
}: AttatchRecordProps) {
	if (variant === "default")
		return (
			<div className={className} {...props}>
				{record.datatitle}
			</div>
		);

	return <p className="inline">{record.datatitle}</p>;
}
