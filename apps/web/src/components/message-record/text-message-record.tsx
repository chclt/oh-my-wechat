import {
	MessageDirection,
	MessageTypeEnum,
	TextMessageRecordType,
	type MessageType,
} from "@repo/types";
import type React from "react";
import { textMessageVariants } from "@/components/message/text-message/libs.ts";
import { cn } from "@/lib/utils.ts";
import TextPrettier from "../text-prettier.tsx";

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
				{record.refermsgitem && (
					<div className="mt-2 pl-1.5 pr-2.5 py-1 text-sm leading-normal text-neutral-600 border-l-2 rounded bg-[rgba(222,222,222,0.3)] border-[rgba(193,193,193,0.6)]">
						{record.refermsgitem.type === MessageTypeEnum.SYSTEM ? (
							record.refermsgitem.content
						) : (
							<TextPrettier
								text={record.refermsgitem.referdesc}
								formatLink={false}
							/>
						)}
					</div>
				)}
			</div>
		);

	if (variant === "note")
		return (
			<div className="">
				<TextPrettier text={record.datadesc} />
			</div>
		);

	return (
		<span className="inline">
			<TextPrettier text={record.datadesc} inline />
		</span>
	);
}
