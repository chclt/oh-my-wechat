import { LinkCard } from "@/components/link-card.tsx";
import type { MessageProp } from "@/components/message/message.tsx";
import type { MailMessageType } from "@/lib/schema.ts";
import MessageInlineWrapper from "./message-inline";

type MailMessageProps = MessageProp<MailMessageType>;

export interface MailMessageEntity {
	msg: {
		pushmail: {
			content: {
				subject: string; // 邮件主题
				attach: boolean;
				sender: string; // 发件人
				digest: string; // e.g. "点击查看全文"
				date: string; // e.g. "2021-03-10 17:17:43"
				fromlist: {
					item: {
						name: string; // 发件人名字
						addr: string; // 发件人邮箱
					};
					"@_count": string; // e.g. "1"
				};
				tolist: {
					item: {
						name: string; // 收件人名字
						addr: string; // 收件人邮箱
					};
					"@_count": string; // e.g. "1"
				};
				cclist: {
					"@_count": string; // e.g. "0"
				};
			};
			mailid: string;
			waplink: string; // 打开邮箱的链接
		};
	};
}

export default function MailMessage({
	message,
	variant = "default",
	...props
}: MailMessageProps) {
	if (variant === "default")
		return (
			<LinkCard
				href={message.message_entity.msg.pushmail.waplink}
				heading={message.message_entity.msg.pushmail.content.subject}
				abstract={message.message_entity.msg.pushmail.content.digest}
				from={message.message_entity.msg.pushmail.content.sender}
			/>
		);

	return (
		<MessageInlineWrapper message={message} {...props}>
			[邮件] {message.message_entity.msg.pushmail.content.subject}
		</MessageInlineWrapper>
	);
}
