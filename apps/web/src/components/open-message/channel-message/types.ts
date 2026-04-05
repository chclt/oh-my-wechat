import { OpenMessageType } from "@/schema";
import type { ChannelOpenMessageEntity } from "@/schema/open-message";

export interface ChannelMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<ChannelOpenMessageEntity>;
}
