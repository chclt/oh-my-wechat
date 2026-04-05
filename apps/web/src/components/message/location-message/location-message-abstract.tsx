import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { LocationMessageProps } from "./types.ts";

export function LocationMessageAbstract({
	message,
	...props
}: LocationMessageProps) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[位置] {message.message_entity.msg.location["@_poiname"]}
		</MessageInlineWrapper>
	);
}
