import { OpenMessageType } from "@/schema";
import type { RealtimeLocationOpenMessageEntity } from "@/schema/open-message";

export interface RealtimeLocationMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<RealtimeLocationOpenMessageEntity>;
}
