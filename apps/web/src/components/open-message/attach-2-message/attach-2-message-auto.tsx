import { Attach2MessageAbstract } from "./attach-2-message-abstract";
import { Attach2MessageDefault } from "./attach-2-message-default";
import type { Attach2MessageProps } from "./types";

export interface Attach2MessageAutoProps extends Attach2MessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function Attach2MessageAuto({
	message,
	variant,
	...props
}: Attach2MessageAutoProps) {
	if (variant === "default") {
		return <Attach2MessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <Attach2MessageAbstract message={message} {...props} />;
	}
}
