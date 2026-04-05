import type { VideoMessageProps } from "./types";
import { VideoMessageAbstract } from "./video-message-abstract";
import { VideoMessageDefault } from "./video-message-default";

export interface VideoMessageAutoProps extends VideoMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function VideoMessageAuto({
	accountId,
	message,
	variant,
	...props
}: VideoMessageAutoProps) {
	if (variant === "default") {
		return (
			<VideoMessageDefault accountId={accountId} message={message} {...props} />
		);
	} else if (variant === "referenced" || variant === "abstract") {
		return <VideoMessageAbstract message={message} {...props} />;
	}
}
