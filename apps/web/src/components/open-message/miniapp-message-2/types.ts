import type { MiniApp2OpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface MiniappMessage2Props
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<MiniApp2OpenMessageEntity>;
}
