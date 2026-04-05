import { LinkCard } from "@/components/link-card.tsx";
import type { MailMessageProps } from "./types.ts";

export function MailMessageDefault({ message, ...props }: MailMessageProps) {
	return (
		<LinkCard
			href={message.message_entity.msg.pushmail.waplink}
			heading={message.message_entity.msg.pushmail.content.subject}
			abstract={message.message_entity.msg.pushmail.content.digest}
			from={message.message_entity.msg.pushmail.content.sender}
		/>
	);
}
