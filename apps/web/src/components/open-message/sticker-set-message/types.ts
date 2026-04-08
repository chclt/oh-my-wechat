import type { StickerSetOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface StickerSetMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<StickerSetOpenMessageEntity>;
}
