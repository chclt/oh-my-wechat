import type { SystemExtendedMessageType } from "@/schema";
import type React from "react";

export interface SystemExtendedMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: SystemExtendedMessageType;
}
