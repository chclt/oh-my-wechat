import { LiveMessageAbstract } from "./live-message-abstract";
import { LiveMessageDefault } from "./live-message-default";
import type { LiveMessageProps } from "./types";

export interface LiveMessageAutoProps extends LiveMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function LiveMessageAuto({
	message,
	variant,
	...props
}: LiveMessageAutoProps) {
	if (variant === "default") {
		return <LiveMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <LiveMessageAbstract message={message} {...props} />;
	}
}
