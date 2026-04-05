import { ChatroomVoipMessageAbstract } from "./chatroom-voip-message-abstract.tsx";
import { ChatroomVoipMessageDefault } from "./chatroom-voip-message-default.tsx";
import type { ChatroomVoipMessageProps } from "./types.ts";

export interface ChatroomVoipMessageAutoProps extends ChatroomVoipMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function ChatroomVoipMessageAuto({
	message,
	variant = "default",
	...props
}: ChatroomVoipMessageAutoProps) {
	if (variant === "default") {
		return <ChatroomVoipMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <ChatroomVoipMessageAbstract message={message} {...props} />;
	}
}
