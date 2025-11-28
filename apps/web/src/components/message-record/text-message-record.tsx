import { textMessageVariants } from "@/components/message/text-message.tsx";
import { cn } from "@/lib/utils.ts";
import { MessageDirection, type MessageType } from "@/schema";
import type React from "react";
import TextPrettier from "../text-prettier.tsx";
import { TextMessageRecordType } from "@/schema/message-record.ts";

interface TextRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: TextMessageRecordType;
	variant: "default" | string;
}

export default function TextMessageRecord({
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
