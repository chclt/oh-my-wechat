import type { SolitaireOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface SolitaireMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<SolitaireOpenMessageEntity>;
}
