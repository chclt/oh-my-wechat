import { StoreMessageAbstract } from "./store-message-abstract";
import { StoreMessageDefault } from "./store-message-default";
import type { StoreMessageProps } from "./types";

export interface StoreMessageAutoProps extends StoreMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function StoreMessageAuto({
	message,
	variant,
	...props
}: StoreMessageAutoProps) {
	if (variant === "default") {
		return <StoreMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <StoreMessageAbstract message={message} {...props} />;
	}
}
