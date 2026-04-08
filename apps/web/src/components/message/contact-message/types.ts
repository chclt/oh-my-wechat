import type { ContactMessageType } from "@repo/types";
import type React from "react";

export interface ContactMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: ContactMessageType;
}
