import { LinkMessage2Abstract } from "./link-message-2-abstract";
import { LinkMessage2Default } from "./link-message-2-default";
import type { LinkMessage2Props } from "./types";

export interface LinkMessage2AutoProps extends LinkMessage2Props {
	variant: "default" | "referenced" | "abstract";
}

export function LinkMessage2Auto({
	accountId,
	message,
	variant,
	...props
}: LinkMessage2AutoProps) {
	if (variant === "default") {
		return (
			<LinkMessage2Default accountId={accountId} message={message} {...props} />
		);
	} else if (variant === "referenced" || variant === "abstract") {
		return <LinkMessage2Abstract message={message} {...props} />;
	}
}
