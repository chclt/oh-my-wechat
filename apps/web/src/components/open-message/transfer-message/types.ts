import type { TransferOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface TransferMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<TransferOpenMessageEntity>;
}
