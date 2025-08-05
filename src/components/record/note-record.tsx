import type { MessageType, RecordTypeEnum } from "@/lib/schema.ts";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";
import type { RecordType } from "./record";

interface NoteRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: NoteRecordEntity;
	variant: "default" | string;
}

export interface NoteRecordEntity extends RecordType {
	"@_datatype": RecordTypeEnum.NOTE;
	datatitle: string;
	datadesc: string;
	recordxml: unknown;
}

export default function NoteRecord({
	message,
	record,
	variant = "default",
	...props
}: NoteRecordProps) {
	if (variant === "default")
		return (
			<div
				className={cn(
					"relative max-w-[20em] flex flex-col rounded-lg bg-white",
				)}
				{...props}
			>
				<div className="p-3">
					{decodeUnicodeReferences(record.datadesc)
						.split("\n")
						.map((segment, index) => (
							<p key={index}>{segment}</p>
						))}
				</div>

				<div
					className={
						"px-3 py-1.5 text-sm leading-normal text-neutral-500 border-t border-neutral-200"
					}
				>
					笔记
				</div>
			</div>
		);

	return (
		<p className="inline" {...props}>
			[笔记] {record.datadesc}
		</p>
	);
}
