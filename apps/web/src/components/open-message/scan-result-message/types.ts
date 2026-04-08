import type { ScanResultOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface ScanResultMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<ScanResultOpenMessageEntity>;
}
