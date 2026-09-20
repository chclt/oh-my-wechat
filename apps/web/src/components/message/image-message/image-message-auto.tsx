import { ImageMessageAbstract } from "./image-message-abstract.tsx";
import { ImageMessageCarouselTrigger } from "./image-message-carousel-trigger.tsx";
import {
	ImageMessageDefault,
	type ImageMessageDefaultProps,
} from "./image-message-default.tsx";
import { ImageMessageReferenced } from "./image-message-referenced.tsx";
import type { ImageMessageProps } from "./types.ts";

export interface ImageMessageAutoProps extends ImageMessageProps {
	variant: "default" | "referenced" | "abstract";
	renderRoot?: ImageMessageDefaultProps["renderRoot"];
}

export function ImageMessageAuto({
	message,
	variant = "default",
	renderRoot,
	...props
}: ImageMessageAutoProps) {
	if (variant === "default") {
		return (
			<ImageMessageDefault
				message={message}
				// TODO: Have the caller supply ImageMessageCarouselTrigger through renderRoot.
				renderRoot={
					renderRoot ?? <ImageMessageCarouselTrigger message={message} />
				}
				{...props}
			/>
		);
	} else if (variant === "referenced") {
		return <ImageMessageReferenced message={message} {...props} />;
	} else if (variant === "abstract") {
		return <ImageMessageAbstract message={message} {...props} />;
	}
}
