import type { Link2OpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface LinkMessage2Props extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<Link2OpenMessageEntity>;
}
