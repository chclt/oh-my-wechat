import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { ChannelVideoMessageProps } from "./types";

export function ChannelVideoMessageAbstract({
	message,
	...props
}: ChannelVideoMessageProps) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[视频号] {message.message_entity.msg.appmsg.finderFeed.nickname}
		</MessageInlineWrapper>
	);
}
