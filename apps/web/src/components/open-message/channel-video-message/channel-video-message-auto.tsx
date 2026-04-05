import { ChannelVideoMessageAbstract } from "./channel-video-message-abstract";
import { ChannelVideoMessageDefault } from "./channel-video-message-default";
import type { ChannelVideoMessageProps } from "./types";

export interface ChannelVideoMessageAutoProps extends ChannelVideoMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function ChannelVideoMessageAuto({
	message,
	variant,
	...props
}: ChannelVideoMessageAutoProps) {
	if (variant === "default") {
		return <ChannelVideoMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <ChannelVideoMessageAbstract message={message} {...props} />;
	}
}
