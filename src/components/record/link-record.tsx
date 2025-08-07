import type { MessageType, RecordTypeEnum } from "@/schema";
import Image from "../image";
import { LinkCard } from "../link-card";
import type { RecordType } from "./record";
import type React from "react";

interface LinkRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: LinkRecordEntity;
	variant: "default" | string;
}

export interface LinkRecordEntity extends RecordType {
	"@_datatype": RecordTypeEnum.LINK;
	datatitle: string;
	datasize: number;
	link: string;
	weburlitem: {
		thumburl?: string;
		title: string;
		desc: string;
		link: string;
		appmsgshareitem?: {
			pubtime: number; // Unix时间戳
			srcdisplayname: string; // 公众号名称
			srcusername: string; // 公众号id
			cover: string;
		};
	};
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
