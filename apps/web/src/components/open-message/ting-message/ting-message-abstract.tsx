import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import type { TingMessageProps } from "./types";

export function TingMessageAbstract({
	message,
	...props
}: Omit<TingMessageProps, "accountId">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			{message.message_entity.msg.appmsg.musicShareItem ? "[音乐]" : "[音频]"}{" "}
			{decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
		</MessageInlineWrapper>
	);
}
