import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { RedEnvelopeMessageProps } from "./types";
import { useAccount } from "@/components/account-provider.tsx";

export function RedEnvelopeMessageAbstract({
	message,
	...props
}: RedEnvelopeMessageProps) {
	const { accountId } = useAccount();

	const userRole: "SENDER" | "RECEIVER" =
		accountId === message.from.user_id ? "SENDER" : "RECEIVER";

	return (
		<MessageInlineWrapper message={message} {...props}>
			[红包]{" "}
			{userRole === "SENDER"
				? message.message_entity.msg.appmsg.wcpayinfo.sendertitle
				: message.message_entity.msg.appmsg.wcpayinfo.receivertitle}
		</MessageInlineWrapper>
	);
}
