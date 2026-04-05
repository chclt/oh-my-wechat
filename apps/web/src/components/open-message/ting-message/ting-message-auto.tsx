import { TingMessageAbstract } from "./ting-message-abstract";
import { TingMessageDefault } from "./ting-message-default";
import type { TingMessageProps } from "./types";

export interface TingMessageAutoProps extends TingMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function TingMessageAuto({
	message,
	variant,
	...props
}: TingMessageAutoProps) {
	if (variant === "default") {
		return <TingMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <TingMessageAbstract message={message} {...props} />;
	}
}
