import { OpenMessageType } from "@/schema";
import type { TingOpenMessageEntity } from "@/schema/open-message";

export interface TingMessageProps extends React.HTMLAttributes<HTMLElement> {
	accountId: string;
	message: OpenMessageType<TingOpenMessageEntity>;
}
