import { OpenMessageType } from "@/schema";
import type { TextOpenMessageEntity } from "@/schema/open-message";

export interface TextMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<TextOpenMessageEntity>;
}
