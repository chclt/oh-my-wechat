import type { VoiceMessageProps } from "./types.ts";
import { VoiceMessageAbstract } from "./voice-message-abstract.tsx";
import { VoiceMessageDefault } from "./voice-message-default.tsx";

export interface VoiceMessageAutoProps extends VoiceMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function VoiceMessageAuto({
	accountId,
	message,
	variant = "default",
	...props
}: VoiceMessageAutoProps) {
	if (variant === "default") {
		return (
			<VoiceMessageDefault accountId={accountId} message={message} {...props} />
		);
	} else if (variant === "referenced" || variant === "abstract") {
		return <VoiceMessageAbstract message={message} {...props} />;
	}
}
