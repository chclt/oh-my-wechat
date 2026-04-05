import { OpenMessageType } from "@/schema";
import type { GameOpenMessageEntity } from "@/schema/open-message";

export interface GameMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<GameOpenMessageEntity>;
}
