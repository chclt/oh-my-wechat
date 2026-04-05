import type { VoipMessageProps } from "./types.ts";
import { VoipMessageAbstract } from "./voip-message-abstract.tsx";
import { VoipMessageDefault } from "./voip-message-default.tsx";

export interface VoipMessageAutoProps extends VoipMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function VoipMessageAuto({
	message,
	variant = "default",
	...props
}: VoipMessageAutoProps) {
	if (variant === "default") {
		return <VoipMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <VoipMessageAbstract message={message} {...props} />;
	}
}
