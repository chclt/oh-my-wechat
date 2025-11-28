import LocalImage from "@/components/local-image";
import type { MessageType } from "@/schema";
import { cn } from "@/lib/utils.ts";
import type React from "react";
import { ImageMessageRecordType } from "@/schema/message-record.ts";

interface ImageRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: ImageMessageRecordType;
	variant: "default" | string;
}

export default function ImageMessageRecord({
	message,
	record,
	variant = "default",
	className,
	...props
}: ImageRecordProps) {
	if (variant === "default")
		return (
			<div className={cn("rounded-lg overflow-hidden", className)} {...props}>
				<LocalImage
					domain="opendata"
					message={message}
					record={record}
					size="origin"
					alt={"图片"}
					className={
						"max-w-[16em] max-h-128 min-w-32 min-h-16 object-contain bg-white"
					}
				/>
			</div>
		);

	return (
		<p className="inline">
			<LocalImage
				domain="opendata"
				message={message}
				record={record}
				size="origin"
				alt={"图片"}
				className={
					"inline mx-[0.2em] align-top max-w-16 max-h-16 rounded overflow-hidden"
				}
			/>
		</p>
	);
}
