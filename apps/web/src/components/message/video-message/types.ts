import type { VideoMessageType } from "@/schema";
import type React from "react";

export interface VideoMessageProps extends React.HTMLAttributes<HTMLElement> {
	accountId: string;
	message: VideoMessageType;
}
