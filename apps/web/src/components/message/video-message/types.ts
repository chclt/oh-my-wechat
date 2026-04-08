import type { VideoMessageType } from "@repo/types";
import type React from "react";

export interface VideoMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: VideoMessageType;
}
