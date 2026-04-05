import type { StickerMessageType } from "@/schema";
import type React from "react";

export interface StickerMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: StickerMessageType;
}
