import { AttachMessageAbstract } from "./attach-message-abstract";
import { AttachMessageDefault } from "./attach-message-default";
import { AttachMessageProps } from "./types";

export interface AttachMessageAutoProps extends AttachMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function AttachMessageAuto({
	accountId,
	message,
	variant,
	...props
}: AttachMessageAutoProps) {
	if (variant === "default") {
		return (
			<AttachMessageDefault
				accountId={accountId}
				message={message}
				{...props}
			/>
		);
	} else if (variant === "referenced" || variant === "abstract") {
		return <AttachMessageAbstract message={message} {...props} />;
	}
}
