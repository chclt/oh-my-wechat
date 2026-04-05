import { SolitaireMessageAbstract } from "./solitaire-message-abstract";
import { SolitaireMessageDefault } from "./solitaire-message-default";
import type { SolitaireMessageProps } from "./types";

export interface SolitaireMessageAutoProps extends SolitaireMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function SolitaireMessageAuto({
	message,
	variant,
	...props
}: SolitaireMessageAutoProps) {
	if (variant === "default") {
		return <SolitaireMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <SolitaireMessageAbstract message={message} {...props} />;
	}
}
