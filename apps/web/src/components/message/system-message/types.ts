import type { SystemMessageType } from "@repo/types";
import type React from "react";

export interface SystemMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: SystemMessageType;
}
