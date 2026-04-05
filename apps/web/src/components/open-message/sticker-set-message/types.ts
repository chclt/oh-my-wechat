import { OpenMessageType } from "@/schema";
import type { StickerSetOpenMessageEntity } from "@/schema/open-message";

export interface StickerSetMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<StickerSetOpenMessageEntity>;
}
