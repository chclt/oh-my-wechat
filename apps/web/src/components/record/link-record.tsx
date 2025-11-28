import type { MessageType } from "@/schema";
import Image from "../image";
import { LinkCard } from "../link-card";
import type React from "react";
import { LinkMessageRecordType } from "@/schema/message-record.ts";

interface LinkRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: LinkMessageRecordType;
	variant: "default" | string;
}

export default function LinkRecord({
	message,
	record,
	variant = "default",
	className,
	...props
}: LinkRecordProps) {
	if (variant === "default")
		return (
			<LinkCard
				href={record.link}
				heading={record.datatitle}
				abstract={record.weburlitem.desc}
				preview={
					record.weburlitem.thumburl ? (
						<Image src={record.weburlitem.thumburl} alt={record.datatitle} />
					) : undefined
				}
				from={record.weburlitem.appmsgshareitem?.srcdisplayname}
				{...props}
			/>
		);

	return <p className="inline">[链接] {record.datatitle}</p>;
}
