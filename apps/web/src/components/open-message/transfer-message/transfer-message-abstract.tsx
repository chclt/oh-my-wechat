import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { TransferMessageProps } from "./types";

export function TransferMessageAbstract({
	message,
	...props
}: Omit<TransferMessageProps, "accountId">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[转账] {message.from.remark ?? message.from.username}
			{message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 8 &&
				"发起转账"}
			{message.message_entity.msg.appmsg.wcpayinfo.paysubtype === 3 &&
				"接收转账"}
		</MessageInlineWrapper>
	);
}
