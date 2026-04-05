import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { MailMessageProps } from "./types.ts";

export function MailMessageAbstract({ message, ...props }: MailMessageProps) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[邮件] {message.message_entity.msg.pushmail.content.subject}
		</MessageInlineWrapper>
	);
}
