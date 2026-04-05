import { OpenMessageType } from "@/schema";
import type { StickerOpenMessageEntity } from "@/schema/open-message";

export interface StickerMessageProps extends React.HTMLAttributes<HTMLElement> {
	accountId: string;
	message: OpenMessageType<StickerOpenMessageEntity>;
}
