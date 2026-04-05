import { ScanResultMessageAbstract } from "./scan-result-message-abstract";
import { ScanResultMessageDefault } from "./scan-result-message-default";
import type { ScanResultMessageProps } from "./types";

export interface ScanResultMessageAutoProps extends ScanResultMessageProps {
	variant: "default" | "abstract";
}

export function ScanResultMessageAuto({
	message,
	variant,
	...props
}: ScanResultMessageAutoProps) {
	if (variant === "default") {
		return <ScanResultMessageDefault message={message} {...props} />;
	} else if (variant === "abstract") {
		return <ScanResultMessageAbstract message={message} {...props} />;
	}
}
