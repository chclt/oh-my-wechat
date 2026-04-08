import type { WeComContactMessageType } from "@repo/types";
import type React from "react";

export interface WeComContactMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: WeComContactMessageType;
}
