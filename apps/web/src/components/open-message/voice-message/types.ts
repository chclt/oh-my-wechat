import type { VoiceOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface VoiceMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<VoiceOpenMessageEntity>;
}
