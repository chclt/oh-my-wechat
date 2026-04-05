import { UrlMessage } from "@/components/open-message/index.ts";
import type { OpenMessageType } from "@/schema";
import type { UrlOpenMessageEntity } from "@/schema/open-message.ts";
import type { VoiceMessageProps } from "./types";

export function VoiceMessageDefault({
	accountId,
	message,
	...props
}: VoiceMessageProps) {
	return (
		<UrlMessage.Default
			accountId={accountId}
			message={message as unknown as OpenMessageType<UrlOpenMessageEntity>}
			{...props}
		/>
	);
}
