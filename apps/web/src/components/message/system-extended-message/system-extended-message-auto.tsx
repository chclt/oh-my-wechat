import { SystemExtendedMessageAbstract } from "./system-extended-message-abstract.tsx";
import { SystemExtendedMessageDefault } from "./system-extended-message-default.tsx";
import type { SystemExtendedMessageProps } from "./types.ts";

export interface SystemExtendedMessageAutoProps
	extends SystemExtendedMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function SystemExtendedMessageAuto({
	accountId,
	message,
	variant = "default",
	...props
}: SystemExtendedMessageAutoProps) {
	if (variant === "default") {
		return (
			<SystemExtendedMessageDefault
				accountId={accountId}
				message={message}
				{...props}
			/>
		);
	} else if (variant === "referenced" || variant === "abstract") {
		return (
			<SystemExtendedMessageAbstract
				accountId={accountId}
				message={message}
				{...props}
			/>
		);
	}
}
