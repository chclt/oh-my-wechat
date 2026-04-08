import type { PatOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface PatMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<PatOpenMessageEntity>;
}
