import type { RealtimeLocationOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface RealtimeLocationMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<RealtimeLocationOpenMessageEntity>;
}
