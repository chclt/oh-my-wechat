import type { WeComContactMessageType } from "@/schema";
import type React from "react";

export interface WeComContactMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: WeComContactMessageType;
}
