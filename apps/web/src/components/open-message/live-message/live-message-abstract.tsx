import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { LiveMessageProps } from "./types";

export function LiveMessageAbstract({
	message,
	...props
}: LiveMessageProps) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[直播] {message.message_entity.msg.appmsg.finderLive.liveNickname})
		</MessageInlineWrapper>
	);
}
