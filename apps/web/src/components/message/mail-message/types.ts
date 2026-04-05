import type { MailMessageType } from "@/schema";
import type React from "react";

export interface MailMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: MailMessageType;
}
