import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { ContactMessageProps } from "./types.ts";

export function ContactMessageAbstract({
	message,
	...props
}: ContactMessageProps) {
	if (message.message_entity.msg["@_certflag"] === "0") {
		return (
			<MessageInlineWrapper message={message} {...props}>
				<span>[名片] {message.message_entity.msg["@_nickname"]}</span>
			</MessageInlineWrapper>
		);
	} else {
		return (
			<MessageInlineWrapper message={message} {...props}>
				<span>[公众号名片] {message.message_entity.msg["@_nickname"]}</span>
			</MessageInlineWrapper>
		);
	}
}
