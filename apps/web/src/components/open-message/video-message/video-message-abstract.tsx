import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import type { VideoMessageProps } from "./types";

export function VideoMessageAbstract({
	message,
	...props
}: Omit<VideoMessageProps, "accountId">) {
	const heading = decodeUnicodeReferences(
		message.message_entity.msg.appmsg.title,
	);

	return (
		<MessageInlineWrapper message={message} {...props}>
			[链接] {heading}
		</MessageInlineWrapper>
	);
}
