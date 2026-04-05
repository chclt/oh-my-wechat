import { PatMessageAbstract } from "./pat-message-abstract";
import { PatMessageDefault } from "./pat-message-default";
import type { PatMessageProps } from "./types";

export interface PatMessageAutoProps extends PatMessageProps {
	variant: "default" | "abstract";
}

export function PatMessageAuto({
	message,
	variant,
	...props
}: PatMessageAutoProps) {
	if (variant === "default") {
		return <PatMessageDefault message={message} {...props} />;
	} else if (variant === "abstract") {
		return <PatMessageAbstract message={message} {...props} />;
	}
}
