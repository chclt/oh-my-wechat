import { useAccount } from "@/components/account-provider.tsx";
import { SystemExtendedMessageAbstract } from "./system-extended-message-abstract.tsx";
import { SystemExtendedMessageDefault } from "./system-extended-message-default.tsx";
import type { SystemExtendedMessageProps } from "./types.ts";

export interface SystemExtendedMessageAutoProps extends SystemExtendedMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function SystemExtendedMessageAuto({
	message,
	variant = "default",
	...props
}: SystemExtendedMessageAutoProps) {
	const { accountId } = useAccount();

	if (variant === "default") {
		return <SystemExtendedMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <SystemExtendedMessageAbstract message={message} {...props} />;
	}
}
