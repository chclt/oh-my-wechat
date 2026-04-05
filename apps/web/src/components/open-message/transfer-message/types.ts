import { OpenMessageType } from "@/schema";
import type { TransferOpenMessageEntity } from "@/schema/open-message";

export interface TransferMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<TransferOpenMessageEntity>;
}
