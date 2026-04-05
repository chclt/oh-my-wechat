import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { WeComContactMessageProps } from "./types.ts";

export function WeComContactMessageAbstract({
	message,
	...props
}: WeComContactMessageProps) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			<span>[企业微信名片] {message.message_entity.msg["@_nickname"]}</span>
		</MessageInlineWrapper>
	);
}
