import { OpenMessageType } from "@/schema";
import type { ChannelVideoOpenMessageEntity } from "@/schema/open-message";

export interface ChannelVideoMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<ChannelVideoOpenMessageEntity>;
}
