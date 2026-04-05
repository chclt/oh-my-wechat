import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import type { VoiceMessageProps } from "./types";

export function VoiceMessageAbstract({
	message,
	...props
}: Omit<VoiceMessageProps, "accountId">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[音频] {decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
		</MessageInlineWrapper>
	);
}
