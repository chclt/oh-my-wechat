import { ForwardMessageAbstract } from "./forward-message-abstract";
import { ForwardMessageDefault } from "./forward-message-default";
import { ForwardMessageReferenced } from "./forward-message-referenced";
import type { ForwardMessageProps } from "./types";

export interface ForwardMessageAutoProps extends ForwardMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function ForwardMessageAuto({
	message,
	variant,
	...props
}: ForwardMessageAutoProps) {
	if (variant === "default") {
		return <ForwardMessageDefault message={message} {...props} />;
	} else if (variant === "referenced") {
		return <ForwardMessageReferenced message={message} {...props} />;
	} else if (variant === "abstract") {
		return <ForwardMessageAbstract message={message} {...props} />;
	}
}
