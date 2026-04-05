import { MiniappMessage2Abstract } from "./miniapp-message-2-abstract";
import { MiniappMessage2Default } from "./miniapp-message-2-default";
import type { MiniappMessage2Props } from "./types";

export interface MiniappMessage2AutoProps extends MiniappMessage2Props {
	variant: "default" | "referenced" | "abstract";
}

export function MiniappMessage2Auto({
	message,
	variant,
	...props
}: MiniappMessage2AutoProps) {
	if (variant === "default") {
		return <MiniappMessage2Default message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <MiniappMessage2Abstract message={message} {...props} />;
	}
}
