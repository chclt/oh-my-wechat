import type { MusicOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface MusicMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<MusicOpenMessageEntity>;
}
