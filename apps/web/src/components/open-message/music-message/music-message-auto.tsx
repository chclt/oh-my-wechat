import { MusicMessageAbstract } from "./music-message-abstract";
import { MusicMessageDefault } from "./music-message-default";
import type { MusicMessageProps } from "./types";

export interface MusicMessageAutoProps extends MusicMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function MusicMessageAuto({
	accountId,
	message,
	variant,
	...props
}: MusicMessageAutoProps) {
	if (variant === "default") {
		return (
			<MusicMessageDefault accountId={accountId} message={message} {...props} />
		);
	} else if (variant === "referenced" || variant === "abstract") {
		return <MusicMessageAbstract message={message} {...props} />;
	}
}
