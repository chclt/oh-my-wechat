import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { RealtimeLocationMessageProps } from "./types";

export function RealtimeLocationMessageAbstract({
	message,
	...props
}: RealtimeLocationMessageProps) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[位置共享] {message.from.remark ?? message.from.username}发起了位置共享)
		</MessageInlineWrapper>
	);
}
