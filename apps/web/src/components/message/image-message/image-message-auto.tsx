import { ImageMessageAbstract } from "./image-message-abstract.tsx";
import type { ImageMessageProps } from "./types.ts";
import { ImageMessageDefault } from "./image-message-default.tsx";
import { ImageMessageReferenced } from "./image-message-referenced.tsx";

export interface ImageMessageAutoProps extends ImageMessageProps {
	variant:
		| "default"
		| "referenced"
		| "abstract"
		| "viewer_detail"
		| "viewer_thumb";
}

export function ImageMessageAuto({
	message,
	variant = "default",
	...props
}: ImageMessageAutoProps) {
	if (variant === "default") {
		return <ImageMessageDefault message={message} {...props} />;
	} else if (variant === "referenced") {
		return <ImageMessageReferenced message={message} {...props} />;
	} else if (variant === "viewer_detail") {
		// TODO
	} else if (variant === "viewer_thumb") {
		return <div {...props}>TODO</div>;
	} else if (variant === "abstract") {
		return <ImageMessageAbstract message={message} {...props} />;
	}
}
