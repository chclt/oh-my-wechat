import { OpenMessageType } from "@/schema";
import type { ScanResultOpenMessageEntity } from "@/schema/open-message";

export interface ScanResultMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<ScanResultOpenMessageEntity>;
}
