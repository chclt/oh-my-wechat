import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { StickerMessageProps } from "./types.ts";

export function StickerMessageAbstract({
	message,
	...props
}: StickerMessageProps) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[表情]
		</MessageInlineWrapper>
	);
}
