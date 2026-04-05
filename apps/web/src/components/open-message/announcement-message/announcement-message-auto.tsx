import { AnnouncementMessageAbstract } from "./announcement-message-abstract";
import { AnnouncementMessageDefault } from "./announcement-message-default";
import type { AnnouncementMessageProps } from "./types";

export interface AnnouncementMessageAutoProps extends AnnouncementMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function AnnouncementMessageAuto({
	message,
	variant,
	...props
}: AnnouncementMessageAutoProps) {
	if (variant === "default") {
		return <AnnouncementMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <AnnouncementMessageAbstract message={message} {...props} />;
	}
}
