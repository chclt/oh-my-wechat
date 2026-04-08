import type { MessageType } from "@repo/types";
import { AttachMessageRecordType } from "@repo/types";
import type React from "react";

interface AttachRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: AttachMessageRecordType;
	variant: "default" | string;
}

export default function AttachMessageRecord({
	message,
	record,
	variant = "default",
	className,
	...props
}: AttachRecordProps) {
	if (variant === "default")
		return (
			<div className={className} {...props}>
				{record.datatitle}
			</div>
		);

	return <p className="inline">{record.datatitle}</p>;
}
