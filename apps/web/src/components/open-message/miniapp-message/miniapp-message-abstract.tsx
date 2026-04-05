import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { MiniappMessageProps } from "./types";

export function MiniappMessageAbstract({
	message,
	...props
}: Omit<MiniappMessageProps, "accountId">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[小程序] {message.message_entity.msg.appmsg.sourcedisplayname}
		</MessageInlineWrapper>
	);
}
