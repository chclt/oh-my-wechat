import { MicroVideoMessageAbstract } from "./micro-video-message-abstract.tsx";
import { MicroVideoMessageDefault } from "./micro-video-message-default.tsx";
import type { MicroVideoMessageProps } from "./types.ts";

export interface MicroVideoMessageAutoProps extends MicroVideoMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function MicroVideoMessageAuto({
	message,
	variant = "default",
	...props
}: MicroVideoMessageAutoProps) {
	if (variant === "default") {
		return <MicroVideoMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <MicroVideoMessageAbstract message={message} {...props} />;
	}
}
