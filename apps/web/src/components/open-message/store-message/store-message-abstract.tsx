import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { StoreMessageProps } from "./types";

export function StoreMessageAbstract({ message, ...props }: StoreMessageProps) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[微信小店]{" "}
			{message.message_entity.msg.appmsg.finderShopWindowShare.nickname}
		</MessageInlineWrapper>
	);
}
