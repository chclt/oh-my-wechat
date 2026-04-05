import type { VoiceMessageProps } from "./types";
import { VoiceMessageAbstract } from "./voice-message-abstract";
import { VoiceMessageDefault } from "./voice-message-default";

export interface VoiceMessageAutoProps extends VoiceMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function VoiceMessageAuto({
	message,
	variant,
	...props
}: VoiceMessageAutoProps) {
	if (variant === "default") {
		return <VoiceMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <VoiceMessageAbstract message={message} {...props} />;
	}
}
