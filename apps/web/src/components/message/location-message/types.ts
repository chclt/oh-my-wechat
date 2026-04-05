import type { LocationMessageType } from "@/schema";
import type React from "react";

export interface LocationMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: LocationMessageType;
}
