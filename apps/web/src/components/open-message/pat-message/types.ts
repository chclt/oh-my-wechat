import { OpenMessageType } from "@/schema";
import type { PatOpenMessageEntity } from "@/schema/open-message";

export interface PatMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<PatOpenMessageEntity>;
}
