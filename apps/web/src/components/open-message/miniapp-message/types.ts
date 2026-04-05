import { OpenMessageType } from "@/schema";
import type { MiniAppOpenMessageEntity } from "@/schema/open-message";

export interface MiniappMessageProps extends React.HTMLAttributes<HTMLElement> {
	accountId: string;
	message: OpenMessageType<MiniAppOpenMessageEntity>;
}
