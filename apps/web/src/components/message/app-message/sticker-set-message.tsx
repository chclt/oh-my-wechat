import Image from "@/components/image.tsx";
import { LinkCard } from "@/components/link-card.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import type { AppMessageTypeEnum } from "@/schema";
import { decodeUnicodeReferences } from "@/lib/utils.ts";

export interface StickerSetMessageEntity {
	type: AppMessageTypeEnum.STICKER_SET;
	title: string;
	des: string;
	url: string;
	thumburl: string;
	emoticonshared: {
		packageflag: 0;
		packageid: string;
	};
}

type StickerSetMessageProps = AppMessageProps<StickerSetMessageEntity>;

export default function StickerSetMessage({
	message,
	variant = "default",
	...props
}: StickerSetMessageProps) {
	const heading = decodeUnicodeReferences(
		message.message_entity.msg.appmsg.title,
	);
	const preview = message.message_entity.msg.appmsg.thumburl ? (
		<Image src={message.message_entity.msg.appmsg.thumburl} alt={heading} />
	) : undefined;

	if (variant === "default")
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

	return (
		<MessageInlineWrapper message={message} {...props}>
			[表情包] {heading}
		</MessageInlineWrapper>
	);
}
