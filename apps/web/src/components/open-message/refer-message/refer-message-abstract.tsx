import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import TextPrettier from "@/components/text-prettier.tsx";
import type { ReferMessageProps } from "./types";

export function ReferMessageAbstract({
	message,
	...props
}: ReferMessageProps) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			<TextPrettier text={message.message_entity.msg.appmsg.title} inline />
		</MessageInlineWrapper>
	);
}
