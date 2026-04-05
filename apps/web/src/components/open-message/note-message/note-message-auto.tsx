import { NoteMessageAbstract } from "./note-message-abstract";
import { NoteMessageDefault } from "./note-message-default";
import type { NoteMessageProps } from "./types";

export interface NoteMessageAutoProps extends NoteMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function NoteMessageAuto({
	accountId,
	message,
	variant,
	...props
}: NoteMessageAutoProps) {
	if (variant === "default") {
		return (
			<NoteMessageDefault accountId={accountId} message={message} {...props} />
		);
	} else if (variant === "referenced" || variant === "abstract") {
		return <NoteMessageAbstract message={message} {...props} />;
	}
}
