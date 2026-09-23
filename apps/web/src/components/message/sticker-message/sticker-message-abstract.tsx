import MessageInlineWrapper from "@/components/message-inline-wrapper";
import { getStickerMessageDescription } from "./libs.ts";
import type { StickerMessageProps } from "./types.ts";

export function StickerMessageAbstract({
	message,
	...props
}: StickerMessageProps) {
	const encodedDescription = message.message_entity.msg.emoji["@_desc"];
	const description = encodedDescription
		? getStickerMessageDescription(encodedDescription)
		: undefined;

	return (
		<MessageInlineWrapper message={message} {...props}>
			{description ? `[${description}]` : "[表情]"}
		</MessageInlineWrapper>
	);
}
