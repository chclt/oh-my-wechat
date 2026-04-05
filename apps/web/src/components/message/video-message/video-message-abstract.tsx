import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { VideoMessageProps } from "./types.ts";

export function VideoMessageAbstract({
	message,
	...props
}: Omit<VideoMessageProps, "accountId">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			<span>[视频]</span>
		</MessageInlineWrapper>
	);
}
