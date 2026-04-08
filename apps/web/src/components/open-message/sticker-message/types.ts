import type { StickerOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface StickerMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<StickerOpenMessageEntity>;
}
