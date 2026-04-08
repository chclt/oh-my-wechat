import type { StoreProductOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface StoreProductMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<StoreProductOpenMessageEntity>;
}
