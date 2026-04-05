import { OpenMessageType } from "@/schema";
import type { LiveOpenMessageEntity } from "@/schema/open-message";

export interface LiveMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<LiveOpenMessageEntity>;
}
