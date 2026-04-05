import { OpenMessageType } from "@/schema";
import type { MiniApp2OpenMessageEntity } from "@/schema/open-message";

export interface MiniappMessage2Props
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<MiniApp2OpenMessageEntity>;
}
