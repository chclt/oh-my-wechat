import type { ChatroomVoipMessageType } from "@/schema";
import type React from "react";

export interface ChatroomVoipMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: ChatroomVoipMessageType;
}
