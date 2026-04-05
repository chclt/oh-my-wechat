import { StickerMessageAbstract } from "./sticker-message-abstract.tsx";
import { StickerMessageDefault } from "./sticker-message-default.tsx";
import type { StickerMessageProps } from "./types.ts";

export interface StickerMessageAutoProps extends StickerMessageProps {
	variant: "default" | "referenced" | "abstract";
}

export function StickerMessageAuto({
	message,
	variant = "default",
	...props
}: StickerMessageAutoProps) {
	if (variant === "default") {
		return <StickerMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <StickerMessageAbstract message={message} {...props} />;
	}
}
