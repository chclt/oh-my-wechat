import { ReferMessageAbstract } from "./refer-message-abstract";
import {
	ReferMessageDefault,
	type ReferMessageDefaultProps,
} from "./refer-message-default";
import { ReferMessageReferenced } from "./refer-message-referenced";
import type { ReferMessageProps } from "./types";

export interface ReferMessageAutoProps extends ReferMessageProps {
	variant: "default" | "referenced" | "abstract";
	renderReference?: ReferMessageDefaultProps["renderReference"];
}

export function ReferMessageAuto({
	message,
	variant,
	renderReference,
	...props
}: ReferMessageAutoProps) {
	if (variant === "default") {
		return (
			<ReferMessageDefault
				message={message}
				renderReference={renderReference}
				{...props}
			/>
		);
	} else if (variant === "referenced") {
		return <ReferMessageReferenced message={message} {...props} />;
	} else if (variant === "abstract") {
		return <ReferMessageAbstract message={message} {...props} />;
	}
}
