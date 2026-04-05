import { OpenMessageType } from "@/schema";
import type { StoreProductOpenMessageEntity } from "@/schema/open-message";

export interface StoreProductMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<StoreProductOpenMessageEntity>;
}
