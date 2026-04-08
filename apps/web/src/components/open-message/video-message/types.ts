import type { VideoOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface VideoMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<VideoOpenMessageEntity>;
}
