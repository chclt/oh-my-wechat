import type { VoipMessageType } from "@/schema";
import type React from "react";

export interface VoipMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: VoipMessageType;
}
