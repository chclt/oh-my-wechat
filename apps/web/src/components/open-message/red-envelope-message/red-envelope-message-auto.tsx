import { AAMessageAbstract } from "./aa-message-abstract";
import { AAMessageDefault } from "./aa-message-default";
import { RedEnvelopeMessageAbstract } from "./red-envelope-message-abstract";
import { RedEnvelopeMessageDefault } from "./red-envelope-message-default";
import type { RedEnvelopeMessageProps } from "./types";

export interface RedEnvelopeMessageAutoProps extends RedEnvelopeMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function RedEnvelopeMessageAuto({
	message,
	variant,
	...props
}: RedEnvelopeMessageAutoProps) {
	const isAA = !!message.message_entity.msg.appmsg.wcpayinfo?.newaa?.newaatype;

	if (isAA) {
		if (variant === "default") {
			return <AAMessageDefault message={message} {...props} />;
		} else if (variant === "referenced" || variant === "abstract") {
			return <AAMessageAbstract message={message} {...props} />;
		}
	} else {
		if (variant === "default") {
			return <RedEnvelopeMessageDefault message={message} {...props} />;
		} else if (variant === "referenced" || variant === "abstract") {
			return <RedEnvelopeMessageAbstract message={message} {...props} />;
		}
	}

	return null;
}
