import { StickerMessageAbstract } from "./sticker-message-abstract";
import { StickerMessageDefault } from "./sticker-message-default";
import type { StickerMessageProps } from "./types";

export interface StickerMessageAutoProps extends StickerMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function StickerMessageAuto({
	message,
	variant,
	...props
}: StickerMessageAutoProps) {
	if (variant === "default") {
		return <StickerMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <StickerMessageAbstract message={message} {...props} />;
	}
}
