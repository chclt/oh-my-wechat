import { TextMessageAbstract } from "./text-message-abstract";
import { TextMessageDefault } from "./text-message-default";
import type { TextMessageProps } from "./types";

export interface TextMessageAutoProps extends TextMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function TextMessageAuto({
	message,
	variant,
	...props
}: TextMessageAutoProps) {
	if (variant === "default") {
		return <TextMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <TextMessageAbstract message={message} {...props} />;
	}
}
