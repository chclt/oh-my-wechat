import type { TingOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface TingMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<TingOpenMessageEntity>;
}
