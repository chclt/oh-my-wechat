import type { SystemExtendedMessageType } from "@repo/types";
import type React from "react";

export interface SystemExtendedMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: SystemExtendedMessageType;
}
