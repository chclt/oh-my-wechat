import { OpenMessageType } from "@/schema";
import type { SolitaireOpenMessageEntity } from "@/schema/open-message";

export interface SolitaireMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<SolitaireOpenMessageEntity>;
}
