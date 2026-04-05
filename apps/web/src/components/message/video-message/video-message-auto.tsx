import type { VideoMessageProps } from "./types.ts";
import { VideoMessageAbstract } from "./video-message-abstract.tsx";
import { VideoMessageDefault } from "./video-message-default.tsx";

export interface VideoMessageAutoProps extends VideoMessageProps {
	variant:
		| "default"
		| "referenced"
		| "abstract"
		| "viewer_detail"
		| "viewer_thumb";
}

export function VideoMessageAuto({
	accountId,
	message,
	variant = "default",
	...props
}: VideoMessageAutoProps) {
	if (variant === "default") {
		return (
			<VideoMessageDefault accountId={accountId} message={message} {...props} />
		);
	} else if (variant === "viewer_detail") {
		return <div {...props}>TODO</div>;
	} else if (variant === "viewer_thumb") {
		return <div {...props}>TODO</div>;
	} else if (variant === "referenced" || variant === "abstract") {
		return <VideoMessageAbstract message={message} {...props} />;
	}
}
