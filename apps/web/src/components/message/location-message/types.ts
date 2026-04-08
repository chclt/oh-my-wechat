import type { LocationMessageType } from "@repo/types";
import type React from "react";

export interface LocationMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: LocationMessageType;
}
