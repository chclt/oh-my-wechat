import { OpenMessageType } from "@/schema";
import type { ReferOpenMessageEntity } from "@/schema/open-message";

export interface ReferMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<ReferOpenMessageEntity>;
}
