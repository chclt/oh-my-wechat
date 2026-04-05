import { WeComContactMessageAbstract } from "./wecom-contact-message-abstract.tsx";
import { WeComContactMessageDefault } from "./wecom-contact-message-default.tsx";
import type { WeComContactMessageProps } from "./types.ts";

export interface WeComContactMessageAutoProps extends WeComContactMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function WeComContactMessageAuto({
	message,
	variant = "default",
	...props
}: WeComContactMessageAutoProps) {
	if (variant === "default") {
		return <WeComContactMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <WeComContactMessageAbstract message={message} {...props} />;
	}
}
