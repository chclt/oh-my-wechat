import type { UrlMessageProps } from "./types";
import { UrlMessageAbstract } from "./url-message-abstract";
import { UrlMessageDefault } from "./url-message-default";

export interface UrlMessageAutoProps extends UrlMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function UrlMessageAuto({
	accountId,
	message,
	variant,
	...props
}: UrlMessageAutoProps) {
	if (variant === "default") {
		return (
			<UrlMessageDefault accountId={accountId} message={message} {...props} />
		);
	} else if (variant === "referenced" || variant === "abstract") {
		return <UrlMessageAbstract message={message} {...props} />;
	}
}
