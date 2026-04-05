import { OpenMessageType } from "@/schema";
import type { AnnouncementOpenMessageEntity } from "@/schema/open-message";

export interface AnnouncementMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<AnnouncementOpenMessageEntity>;
}
