import type { UrlOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface UrlMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<UrlOpenMessageEntity>;
}
