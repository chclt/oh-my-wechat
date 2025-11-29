import Image from "@/components/image.tsx";
import { LinkCard } from "@/components/link-card.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import { decodeUnicodeReferences } from "@/lib/utils.ts";

import { StickerSetOpenMessageEntity } from "@/schema/open-message.ts";

type StickerSetMessageProps = OpenMessageProps<StickerSetOpenMessageEntity>;

export default function StickerSetMessage({
	message,
	variant = "default",
	...props
}: StickerSetMessageProps) {
	if (variant === "default") {
		return <StickerSetMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <StickerSetMessageAbstract message={message} {...props} />;
	}
}

function StickerSetMessageDefault({
	message,
	...props
}: Omit<StickerSetMessageProps, "variant">) {
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

function StickerSetMessageAbstract({
	message,
	...props
}: Omit<StickerSetMessageProps, "variant">) {
	const heading = decodeUnicodeReferences(
		message.message_entity.msg.appmsg.title,
	);

	return (
		<MessageInlineWrapper message={message} {...props}>
			[表情包] {heading}
		</MessageInlineWrapper>
	);
}
