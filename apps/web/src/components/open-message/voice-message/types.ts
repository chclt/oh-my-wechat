import { OpenMessageType } from "@/schema";
import type { VoiceOpenMessageEntity } from "@/schema/open-message";

export interface VoiceMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<VoiceOpenMessageEntity>;
}
