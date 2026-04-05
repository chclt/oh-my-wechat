import { MiniappMessageAbstract } from "./miniapp-message-abstract";
import { MiniappMessageDefault } from "./miniapp-message-default";
import type { MiniappMessageProps } from "./types";

export interface MiniappMessageAutoProps extends MiniappMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function MiniappMessageAuto({
	accountId,
	message,
	variant,
	...props
}: MiniappMessageAutoProps) {
	if (variant === "default") {
		return (
			<MiniappMessageDefault
				accountId={accountId}
				message={message}
				{...props}
			/>
		);
	} else if (variant === "referenced" || variant === "abstract") {
		return <MiniappMessageAbstract message={message} {...props} />;
	}
}
