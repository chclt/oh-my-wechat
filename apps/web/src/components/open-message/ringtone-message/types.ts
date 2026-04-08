import type { RingtoneOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface RingtoneMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<RingtoneOpenMessageEntity>;
}
