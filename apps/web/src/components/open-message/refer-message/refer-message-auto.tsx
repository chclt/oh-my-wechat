import { ReferMessageAbstract } from "./refer-message-abstract";
import { ReferMessageDefault } from "./refer-message-default";
import { ReferMessageReferenced } from "./refer-message-referenced";
import type { ReferMessageProps } from "./types";

export interface ReferMessageAutoProps extends ReferMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function ReferMessageAuto({
	message,
	variant,
	...props
}: ReferMessageAutoProps) {
	if (variant === "default") {
		return <ReferMessageDefault message={message} {...props} />;
	} else if (variant === "referenced") {
		return <ReferMessageReferenced message={message} {...props} />;
	} else if (variant === "abstract") {
		return <ReferMessageAbstract message={message} {...props} />;
	}
}
