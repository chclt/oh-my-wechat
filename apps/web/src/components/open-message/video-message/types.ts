import { OpenMessageType } from "@/schema";
import type { VideoOpenMessageEntity } from "@/schema/open-message";

export interface VideoMessageProps extends React.HTMLAttributes<HTMLElement> {
	accountId: string;
	message: OpenMessageType<VideoOpenMessageEntity>;
}
