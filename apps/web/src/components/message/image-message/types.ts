import type { ImageMessageType } from "@/schema";
import type React from "react";

export interface ImageMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: ImageMessageType;
}
