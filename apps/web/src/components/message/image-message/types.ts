import type { ImageMessageType } from "@repo/types";
import type React from "react";

export interface ImageMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: ImageMessageType;
}
