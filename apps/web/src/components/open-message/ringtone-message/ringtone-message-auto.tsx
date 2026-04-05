import { RingtoneMessageAbstract } from "./ringtone-message-abstract";
import { RingtoneMessageDefault } from "./ringtone-message-default";
import type { RingtoneMessageProps } from "./types";

export interface RingtoneMessageAutoProps extends RingtoneMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function RingtoneMessageAuto({
	message,
	variant,
	...props
}: RingtoneMessageAutoProps) {
	if (variant === "default") {
		return <RingtoneMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <RingtoneMessageAbstract message={message} {...props} />;
	}
}
