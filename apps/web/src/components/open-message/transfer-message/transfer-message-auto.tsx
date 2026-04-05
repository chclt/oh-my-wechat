import { TransferMessageAbstract } from "./transfer-message-abstract";
import { TransferMessageDefault } from "./transfer-message-default";
import type { TransferMessageProps } from "./types";

export interface TransferMessageAutoProps extends TransferMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function TransferMessageAuto({
	accountId,
	message,
	variant,
	...props
}: TransferMessageAutoProps) {
	if (variant === "default") {
		return (
			<TransferMessageDefault
				accountId={accountId}
				message={message}
				{...props}
			/>
		);
	} else if (variant === "referenced" || variant === "abstract") {
		return <TransferMessageAbstract message={message} {...props} />;
	}
}
