import type { SystemMessageType } from "@/schema";
import type React from "react";

export interface SystemMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: SystemMessageType;
}
