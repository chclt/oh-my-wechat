import { LocationMessageAbstract } from "./location-message-abstract.tsx";
import { LocationMessageDefault } from "./location-message-default.tsx";
import type { LocationMessageProps } from "./types.ts";

export interface LocationMessageAutoProps extends LocationMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function LocationMessageAuto({
	message,
	variant = "default",
	...props
}: LocationMessageAutoProps) {
	if (variant === "default") {
		return <LocationMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <LocationMessageAbstract message={message} {...props} />;
	}
}
