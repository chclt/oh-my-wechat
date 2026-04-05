import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { NoteMessageProps } from "./types";

export function NoteMessageAbstract({
	message,
	...props
}: Omit<NoteMessageProps, "accountId">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[笔记] {message.message_entity.msg.appmsg.des}
		</MessageInlineWrapper>
	);
}
