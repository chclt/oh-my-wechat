import type { MiniAppOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface MiniappMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<MiniAppOpenMessageEntity>;
}
