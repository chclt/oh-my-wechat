import type { MicroVideoMessageType } from "@repo/types";
import type React from "react";

export interface MicroVideoMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: MicroVideoMessageType;
}
