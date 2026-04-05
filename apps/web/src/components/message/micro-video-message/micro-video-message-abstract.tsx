import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { MicroVideoMessageProps } from "./types.ts";

export function MicroVideoMessageAbstract({
	message,
	...props
}: Omit<MicroVideoMessageProps, "accountId">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[视频]
		</MessageInlineWrapper>
	);
}
