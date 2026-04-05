import { OpenMessageType } from "@/schema";
import type { StoreOpenMessageEntity } from "@/schema/open-message";

export interface StoreMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<StoreOpenMessageEntity>;
}
