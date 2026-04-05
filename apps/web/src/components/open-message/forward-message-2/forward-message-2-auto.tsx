import { ForwardMessage2Abstract } from "./forward-message-2-abstract";
import { ForwardMessage2Default } from "./forward-message-2-default";
import type { ForwardMessage2Props } from "./types";

export interface ForwardMessage2AutoProps extends ForwardMessage2Props {
	variant: "default" | "referenced" | "abstract";
}

export function ForwardMessage2Auto({
	message,
	variant,
	...props
}: ForwardMessage2AutoProps) {
	if (variant === "default") {
		return <ForwardMessage2Default message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <ForwardMessage2Abstract message={message} {...props} />;
	}
}
