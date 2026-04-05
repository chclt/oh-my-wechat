import { OpenMessageType } from "@/schema";
import type { RingtoneOpenMessageEntity } from "@/schema/open-message";

export interface RingtoneMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<RingtoneOpenMessageEntity>;
}
