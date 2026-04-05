import { OpenMessageType } from "@/schema";
import type { TingOpenMessageEntity } from "@/schema/open-message";

export interface TingMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<TingOpenMessageEntity>;
}
