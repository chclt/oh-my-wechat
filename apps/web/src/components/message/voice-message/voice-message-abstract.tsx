import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { VoiceMessageProps } from "./types.ts";

export function VoiceMessageAbstract({
	message,
	...props
}: Omit<VoiceMessageProps, "accountId">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[语音]{" "}
			{Math.floor(
				Number.parseInt(message.message_entity.msg.voicemsg["@_voicelength"]) /
					1000,
			)}
			″
		</MessageInlineWrapper>
	);
}
