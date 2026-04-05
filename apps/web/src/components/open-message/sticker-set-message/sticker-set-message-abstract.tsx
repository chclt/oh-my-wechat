import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import type { StickerSetMessageProps } from "./types";

export function StickerSetMessageAbstract({
	message,
	...props
}: StickerSetMessageProps) {
	const heading = decodeUnicodeReferences(
		message.message_entity.msg.appmsg.title,
	);

	return (
		<MessageInlineWrapper message={message} {...props}>
			[表情包] {heading}
		</MessageInlineWrapper>
	);
}
