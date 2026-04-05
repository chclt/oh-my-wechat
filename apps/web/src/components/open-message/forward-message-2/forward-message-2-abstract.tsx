import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import type { ForwardMessage2Props } from "./types";

export function ForwardMessage2Abstract({
	message,
	...props
}: ForwardMessage2Props) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			{decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
		</MessageInlineWrapper>
	);
}
