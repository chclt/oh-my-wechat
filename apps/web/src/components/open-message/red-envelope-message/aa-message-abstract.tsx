import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import { MessageDirection } from "@/schema";
import type { RedEnvelopeMessageProps } from "./types";

export function AAMessageAbstract({
	message,
	...props
}: Omit<RedEnvelopeMessageProps, "accountId">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[AA 收款]{" "}
			{message.direction === MessageDirection.outgoing
				? message.message_entity.msg.appmsg.wcpayinfo.sendertitle
				: message.message_entity.msg.appmsg.wcpayinfo.receivertitle}
		</MessageInlineWrapper>
	);
}
