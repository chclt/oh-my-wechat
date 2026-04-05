import { OpenMessageType } from "@/schema/message";
import type { ForwardOpenMessageEntity } from "@/schema/open-message";
import type React from "react";

export interface ForwardMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<ForwardOpenMessageEntity>;
}
