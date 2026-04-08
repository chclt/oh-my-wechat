import type { ChatroomVoipMessageType } from "@repo/types";
import type React from "react";

export interface ChatroomVoipMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: ChatroomVoipMessageType;
}
