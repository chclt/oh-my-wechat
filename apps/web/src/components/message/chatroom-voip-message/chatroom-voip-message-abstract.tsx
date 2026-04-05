import type { ChatroomVoipMessageProps } from "./types.ts";

export function ChatroomVoipMessageAbstract({
	message,
	...props
}: ChatroomVoipMessageProps) {
	return (
		<div className={"mx-auto text-sm text-neutral-600"} {...props}>
			<p>{message.message_entity.msgContent}</p>
		</div>
	);
}
