import { ChannelMessageAbstract } from "./channel-message-abstract";
import { ChannelMessageDefault } from "./channel-message-default";
import type { ChannelMessageProps } from "./types";

export interface ChannelMessageAutoProps extends ChannelMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function ChannelMessageAuto({
	message,
	variant,
	...props
}: ChannelMessageAutoProps) {
	if (variant === "default") {
		return <ChannelMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <ChannelMessageAbstract message={message} {...props} />;
	}
}
