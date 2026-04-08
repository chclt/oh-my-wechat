import type { AnnouncementOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface AnnouncementMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<AnnouncementOpenMessageEntity>;
}
