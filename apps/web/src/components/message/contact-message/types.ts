import type { ContactMessageType } from "@/schema";
import type React from "react";

export interface ContactMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: ContactMessageType;
}
