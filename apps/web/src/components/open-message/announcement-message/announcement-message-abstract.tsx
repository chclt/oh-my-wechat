import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { AnnouncementMessageProps } from "./types";

export function AnnouncementMessageAbstract({
	message,
	...props
}: AnnouncementMessageProps) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[公告] {message.message_entity.msg.appmsg.textannouncement}
		</MessageInlineWrapper>
	);
}
