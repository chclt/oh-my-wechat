import type { VoiceMessageType } from "@repo/types";
import type React from "react";

export interface VoiceMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: VoiceMessageType;
}
