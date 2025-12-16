import Image from "@/components/image.tsx";
import {
	Card,
	CardContent,
	CardFooter,
	CardTitle,
} from "@/components/ui/card.tsx";
import type { MessageType } from "@/schema";
import type React from "react";
import { ChannelMessageRecordType } from "@/schema/message-record.ts";

interface ChannelRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: ChannelMessageRecordType;
	variant: "default" | string;
}

export default function ChannelMessageRecord({
	message,
	record,
	variant = "default",
	...props
}: ChannelRecordProps) {
	if (variant === "default")
		return (
			<Card className="max-w-[20em] w-fit" {...props}>
				<CardContent className={"flex items-center p-2.5 pr-4"}>
					<Image
						src={record.finderShareNameCard.avatar}
						alt={record.datatitle}
						className={"shrink-0 size-12 rounded-full"}
					/>
					<CardTitle className="font-medium">{record.datatitle}</CardTitle>
				</CardContent>
				<CardFooter>视频号名片</CardFooter>
			</Card>
		);

	return <p>[视频号名片] {record.datatitle}</p>;
}
