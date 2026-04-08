import type { ReferOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface ReferMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<ReferOpenMessageEntity>;
}
