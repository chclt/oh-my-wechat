import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import type { UrlMessageProps } from "./types";

export function UrlMessageAbstract({
	message,
	...props
}: Omit<UrlMessageProps, "accountId">) {
	const heading = decodeUnicodeReferences(
		message.message_entity.msg.appmsg.title,
	);

	return (
		<MessageInlineWrapper message={message} {...props}>
			[链接] {heading}
		</MessageInlineWrapper>
	);
}
