import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { ChannelMessageProps } from "./types";

export function ChannelMessageAbstract({
	message,
	...props
}: ChannelMessageProps) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[频道名片] {message.message_entity.msg.appmsg.findernamecard.nickname}
		</MessageInlineWrapper>
	);
}
