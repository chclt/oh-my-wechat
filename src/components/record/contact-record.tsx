import Image from "@/components/image.tsx";
import {
	Card,
	CardContent,
	CardFooter,
	CardTitle,
} from "@/components/ui/card.tsx";
import type { MessageType, RecordTypeEnum } from "@/schema";
import { XMLParser } from "fast-xml-parser";
import type { RecordType } from "./record";

interface ContactRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: ContactRecordEntity;
	variant: "default" | string;
}

export interface ContactRecordEntity extends RecordType {
	"@_datatype": RecordTypeEnum.CONTACT;
	datasize: number;
	datadesc: string; // xml
}

export default function ContactRecord({
	message,
	record,
	variant = "default",
	...props
}: ContactRecordProps) {
	const xmlParser = new XMLParser({
		ignoreAttributes: false,
	});
	const dataEntity = xmlParser.parse(record.datadesc);
	console.log(dataEntity);

	if (dataEntity.msg["@_certflag"] === "0") {
		return <p>[名片] {dataEntity.msg["@_nickname"]}</p>;
	}

	if (variant === "default")
		return (
			<Card className="max-w-[20em] w-fit" {...props}>
				<CardContent className={"flex items-center p-2.5 pr-4"}>
					<Image
						src={dataEntity.msg["@_brandIconUrl"]}
						alt={dataEntity.msg["@_nickname"]}
						className={"shrink-0 size-12 rounded-full"}
					/>
					<div className="ml-4 flex flex-col space-y-0.5">
						<CardTitle className="line-clamp-1">
							{dataEntity.msg["@_nickname"]}
						</CardTitle>
						<p className={"text-sm line-clamp-1 text-muted-foreground"}>
							{dataEntity.msg["@_certinfo"]}
						</p>
					</div>
				</CardContent>
				<CardFooter>公众号名片</CardFooter>
			</Card>
		);

	return <p className="inline">[公众号名片] {dataEntity.msg["@_nickname"]}</p>;
}
