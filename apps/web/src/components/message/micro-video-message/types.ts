import type { MicroVideoMessageType } from "@/schema";
import type React from "react";

export interface MicroVideoMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	accountId: string;
	message: MicroVideoMessageType;
}
