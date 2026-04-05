import { OpenMessageType } from "@/schema";
import type { UrlOpenMessageEntity } from "@/schema/open-message";

export interface UrlMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<UrlOpenMessageEntity>;
}
