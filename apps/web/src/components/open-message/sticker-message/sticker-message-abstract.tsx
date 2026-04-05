import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { StickerMessageProps } from "./types";

export function StickerMessageAbstract({
	message,
	...props
}: Omit<StickerMessageProps, "accountId">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[表情]
		</MessageInlineWrapper>
	);
}
