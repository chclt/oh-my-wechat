import { OpenMessageType } from "@/schema";
import type { MusicOpenMessageEntity } from "@/schema/open-message";

export interface MusicMessageProps extends React.HTMLAttributes<HTMLElement> {
	accountId: string;
	message: OpenMessageType<MusicOpenMessageEntity>;
}
