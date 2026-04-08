import type { OpenMessageType, UrlOpenMessageEntity } from "@repo/types";
import { UrlMessage } from "@/components/open-message/index.ts";
import type { VoiceMessageProps } from "./types";

export function VoiceMessageDefault({ message, ...props }: VoiceMessageProps) {
	return (
		<UrlMessage.Default
			message={message as unknown as OpenMessageType<UrlOpenMessageEntity>}
			{...props}
		/>
	);
}
