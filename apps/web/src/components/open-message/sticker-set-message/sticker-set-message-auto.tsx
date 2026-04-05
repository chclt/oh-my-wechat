import { StickerSetMessageAbstract } from "./sticker-set-message-abstract";
import { StickerSetMessageDefault } from "./sticker-set-message-default";
import type { StickerSetMessageProps } from "./types";

export interface StickerSetMessageAutoProps extends StickerSetMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function StickerSetMessageAuto({
	message,
	variant,
	...props
}: StickerSetMessageAutoProps) {
	if (variant === "default") {
		return <StickerSetMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <StickerSetMessageAbstract message={message} {...props} />;
	}
}
