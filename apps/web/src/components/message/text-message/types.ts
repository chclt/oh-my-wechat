import type { TextMessageType } from "@/schema";
import type React from "react";

export interface TextMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: TextMessageType;
}

export type TextMessageEntity = string;
