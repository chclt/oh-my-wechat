import { SystemMessageAbstract } from "./system-message-abstract.tsx";
import { SystemMessageDefault } from "./system-message-default.tsx";
import { SystemMessageReferenced } from "./system-message-referenced.tsx";
import type { SystemMessageProps } from "./types.ts";

export interface SystemMessageAutoProps extends SystemMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function SystemMessageAuto({
	message,
	variant = "default",
	...props
}: SystemMessageAutoProps) {
	if (variant === "default") {
		return <SystemMessageDefault message={message} {...props} />;
	} else if (variant === "referenced") {
		return <SystemMessageReferenced message={message} {...props} />;
	} else if (variant === "abstract") {
		return <SystemMessageAbstract message={message} {...props} />;
	}
}
