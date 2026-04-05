import { OpenMessageType } from "@/schema";
import type { UrlOpenMessageEntity } from "@/schema/open-message";

export interface UrlMessageProps extends React.HTMLAttributes<HTMLElement> {
	accountId: string;
	message: OpenMessageType<UrlOpenMessageEntity>;
}
