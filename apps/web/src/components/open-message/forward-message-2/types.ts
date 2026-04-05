import { OpenMessageType } from "@/schema";
import type { Forward2OpenMessageEntity } from "@/schema/open-message";

export interface ForwardMessage2Props
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<Forward2OpenMessageEntity>;
}
