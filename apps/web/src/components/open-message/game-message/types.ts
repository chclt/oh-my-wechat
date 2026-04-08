import type { GameOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface GameMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<GameOpenMessageEntity>;
}
