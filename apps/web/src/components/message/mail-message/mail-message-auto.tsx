import { MailMessageAbstract } from "./mail-message-abstract.tsx";
import { MailMessageDefault } from "./mail-message-default.tsx";
import type { MailMessageProps } from "./types.ts";

export interface MailMessageAutoProps extends MailMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function MailMessageAuto({
	message,
	variant = "default",
	...props
}: MailMessageAutoProps) {
	if (variant === "default") {
		return <MailMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <MailMessageAbstract message={message} {...props} />;
	}
}
