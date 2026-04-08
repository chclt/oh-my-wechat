import type { TextOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface TextMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<TextOpenMessageEntity>;
}
