import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import type { MusicMessageProps } from "./types";

export function MusicMessageAbstract({
	message,
	...props
}: Omit<MusicMessageProps, "accountId">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[音乐] {decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
		</MessageInlineWrapper>
	);
}
