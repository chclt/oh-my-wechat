import { OpenMessageType } from "@/schema";
import type { MiniApp2OpenMessageEntity } from "@/schema/open-message";

export interface MiniappMessage2Props
	extends React.HTMLAttributes<HTMLElement> {
	accountId: string;
	message: OpenMessageType<MiniApp2OpenMessageEntity>;
}
