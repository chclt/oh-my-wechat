import type { ChannelVideoOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface ChannelVideoMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<ChannelVideoOpenMessageEntity>;
}
