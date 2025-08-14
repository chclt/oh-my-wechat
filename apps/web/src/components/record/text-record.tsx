import {
	FormatTextMessageContent,
	textMessageVariants,
} from "@/components/message/text-message.tsx";
import {
	MessageDirection,
	type MessageType,
	type RecordTypeEnum,
} from "@/schema";
import { cn } from "@/lib/utils.ts";
import type { RecordType } from "./record";
import type React from "react";

interface TextRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: TextRecordEntity;
	variant: "default" | string;
}

export interface TextRecordEntity extends RecordType {
	"@_datatype": RecordTypeEnum.TEXT;
	datadesc: string;
}

export default function TextRecord({
	message,
	record,
	variant = "default",
	className,
	...props
}: TextRecordProps) {
	if (variant === "default")
		return (
			<div
				className={cn(
					textMessageVariants({
						variant: "default",
						direction: MessageDirection.incoming,
						className,
					}),
				)}
				{...props}
			>
				<FormatTextMessageContent text={record.datadesc} />
			</div>
		);

	if (variant === "note")
		return (
			<div className="">
				<FormatTextMessageContent text={record.datadesc} />
			</div>
		);

	return (
		<p className="inline">
			<FormatTextMessageContent text={record.datadesc} className={"inline"} />
		</p>
	);
}
