import type { ChatroomVoipMessageProps } from "./types.ts";

export function ChatroomVoipMessageAbstract({
	message,
	...props
}: ChatroomVoipMessageProps) {
	return (
		<span className={"mx-auto text-sm text-neutral-600"} {...props}>
			{message.message_entity.msgContent}
		</span>
	);
}
