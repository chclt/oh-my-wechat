import type { Forward2OpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface ForwardMessage2Props extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<Forward2OpenMessageEntity>;
}
