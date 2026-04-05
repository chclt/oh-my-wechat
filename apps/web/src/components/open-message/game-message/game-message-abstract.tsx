import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { GameMessageProps } from "./types";

export function GameMessageAbstract({
	message,
	...props
}: Omit<GameMessageProps, "accountId">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[游戏] {message.message_entity.msg.appmsg.title}
		</MessageInlineWrapper>
	);
}
