import type { ChannelOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface ChannelMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<ChannelOpenMessageEntity>;
}
