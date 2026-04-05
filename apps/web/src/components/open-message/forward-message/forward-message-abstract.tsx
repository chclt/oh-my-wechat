import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import type { ForwardMessageProps } from "./types";

export function ForwardMessageAbstract({
	message,
	...props
}: ForwardMessageProps) {
	const title = decodeUnicodeReferences(
		message.message_entity.msg.appmsg.title,
	);

	return (
		<MessageInlineWrapper message={message} {...props}>
			<span>{title}</span>
		</MessageInlineWrapper>
	);
}
