import { textMessageVariants } from "@/components/message/text-message.tsx";
import { cn } from "@/lib/utils.ts";
import {
	MessageDirection,
	type MessageType,
	type RecordTypeEnum,
} from "@/schema";
import type React from "react";
import TextPrettier from "../text-prettier.tsx";
import type { RecordType } from "./record";

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
				<TextPrettier text={record.datadesc} />
			</div>
		);

	if (variant === "note")
		return (
			<div className="">
				<TextPrettier text={record.datadesc} />
			</div>
		);

	return (
		<p className="inline">
			<TextPrettier text={record.datadesc} inline />
		</p>
	);
}
