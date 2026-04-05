import { ContactMessageAbstract } from "./contact-message-abstract.tsx";
import { ContactMessageDefault } from "./contact-message-default.tsx";
import type { ContactMessageProps } from "./types.ts";

export interface ContactMessageAutoProps extends ContactMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function ContactMessageAuto({
	message,
	variant = "default",
	...props
}: ContactMessageAutoProps) {
	if (variant === "default") {
		return <ContactMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <ContactMessageAbstract message={message} {...props} />;
	}
}
