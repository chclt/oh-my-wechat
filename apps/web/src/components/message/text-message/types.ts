import type { TextMessageType } from "@repo/types";
import type React from "react";

export interface TextMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: TextMessageType;
}
