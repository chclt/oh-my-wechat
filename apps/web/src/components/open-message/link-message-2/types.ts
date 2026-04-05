import { OpenMessageType } from "@/schema";
import type { Link2OpenMessageEntity } from "@/schema/open-message";

export interface LinkMessage2Props extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<Link2OpenMessageEntity>;
}
