import type { StoreOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface StoreMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<StoreOpenMessageEntity>;
}
