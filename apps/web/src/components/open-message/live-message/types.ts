import type { LiveOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface LiveMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<LiveOpenMessageEntity>;
}
