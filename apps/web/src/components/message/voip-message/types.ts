import type { VoipMessageType } from "@repo/types";
import type React from "react";

export interface VoipMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: VoipMessageType;
}
