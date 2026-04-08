import { RealtimeLocationMessageAbstract } from "./realtime-location-message-abstract";
import { RealtimeLocationMessageDefault } from "./realtime-location-message-default";
import type { RealtimeLocationMessageProps } from "./types";

export interface RealtimeLocationMessageAutoProps extends RealtimeLocationMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function RealtimeLocationMessageAuto({
	message,
	variant,
	...props
}: RealtimeLocationMessageAutoProps) {
	if (variant === "default") {
		return <RealtimeLocationMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <RealtimeLocationMessageAbstract message={message} {...props} />;
	}
}
