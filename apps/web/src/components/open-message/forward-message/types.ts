import type { ForwardOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";
import type React from "react";

export interface ForwardMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<ForwardOpenMessageEntity>;
}
