import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { TextMessageProps } from "./types";

export function TextMessageAbstract({ message, ...props }: TextMessageProps) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			{message.message_entity.msg.appmsg.title}
		</MessageInlineWrapper>
	);
}
