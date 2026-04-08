import type { StickerMessageType } from "@repo/types";
import type React from "react";

export interface StickerMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: StickerMessageType;
}
