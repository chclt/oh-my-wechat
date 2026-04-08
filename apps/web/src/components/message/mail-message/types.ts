import type { MailMessageType } from "@repo/types";
import type React from "react";

export interface MailMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: MailMessageType;
}
