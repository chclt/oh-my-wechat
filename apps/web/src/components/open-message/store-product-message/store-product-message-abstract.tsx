import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { StoreProductMessageProps } from "./types";

export function StoreProductMessageAbstract({
	message,
	...props
}: StoreProductMessageProps) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[微信小店]{" "}
			{message.message_entity.msg.appmsg.finderLiveProductShare.productTitle}
		</MessageInlineWrapper>
	);
}
