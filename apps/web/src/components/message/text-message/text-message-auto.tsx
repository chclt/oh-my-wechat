import { TextMessageAbstract } from "./text-message-abstract.tsx";
import type { TextMessageProps } from "./types.ts";
import { TextMessageDefault } from "./text-message-default.tsx";
import { TextMessageReferenced } from "./text-message-referenced.tsx";

export interface TextMessageAutoProps extends TextMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function TextMessageAuto({
	message,
	variant = "default",
	...props
}: TextMessageAutoProps) {
	if (variant === "default") {
		return <TextMessageDefault message={message} {...props} />;
	} else if (variant === "referenced") {
		return <TextMessageReferenced message={message} {...props} />;
	} else if (variant === "abstract") {
		return <TextMessageAbstract message={message} {...props} />;
	}
}
