import type { VoiceMessageType } from "@/schema";
import type React from "react";

export interface VoiceMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: VoiceMessageType;
}
