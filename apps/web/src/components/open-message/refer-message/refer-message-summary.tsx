import {
	MessageTypeEnum,
	type OpenMessageEntity,
	type ReferOpenMessageEntity,
} from "@repo/types";
import { XMLParser } from "fast-xml-parser";
import TextPrettier from "@/components/text-prettier";

interface ReferMessageSummaryProps {
	reference: ReferOpenMessageEntity["refermsg"];
}

export function ReferMessageSummary({ reference }: ReferMessageSummaryProps) {
	if (reference.type === MessageTypeEnum.SYSTEM) return reference.content;

	let text = reference.content;
	if (reference.type === MessageTypeEnum.APP) {
		const xmlParser = new XMLParser({
			parseTagValue: false,
			trimValues: false,
		});
		const content: OpenMessageEntity<{ title?: string }> = xmlParser.parse(
			reference.content,
		);
		text = content.msg.appmsg.title ?? reference.content;
	}

	return (
		<span>
			{reference.displayname && <span>{reference.displayname}: </span>}
			<TextPrettier text={text} inline formatLink={false} />
		</span>
	);
}
