import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { SolitaireMessageProps } from "./types";

export function SolitaireMessageAbstract({
	message,
	...props
}: SolitaireMessageProps) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			{message.message_entity.msg.appmsg.title}
		</MessageInlineWrapper>
	);
}
