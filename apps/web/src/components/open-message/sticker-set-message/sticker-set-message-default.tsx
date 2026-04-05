import Image from "@/components/image.tsx";
import { LinkCard } from "@/components/link-card.tsx";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import type { StickerSetMessageProps } from "./types";

export function StickerSetMessageDefault({
	message,
	...props
}: StickerSetMessageProps) {
	const heading = decodeUnicodeReferences(
		message.message_entity.msg.appmsg.title,
	);

	const preview = message.message_entity.msg.appmsg.thumburl ? (
		<Image src={message.message_entity.msg.appmsg.thumburl} alt={heading} />
	) : undefined;

	return (
		<LinkCard
			href={undefined}
			heading={heading}
			abstract={message.message_entity.msg.appmsg.des}
			preview={preview}
			from={"表情包"}
			icon={<span />}
			{...props}
		/>
	);
}
