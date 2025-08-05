import LocalVoice from "@/components/local-voice.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import type { MessageProp } from "@/components/message/message.tsx";
import type { VoiceMessageType } from "@/schema";
import { cn } from "@/lib/utils.ts";

type VoiceMessageProps = MessageProp<VoiceMessageType>;

export interface VoiceMessageEntity {
	msg: {
		voicemsg: {
			"@_endflag": "0" | "1";
			"@_cancelflag": "0" | "1";
			"@_forwardflag": "0" | "1";
			"@_voiceformat": string;
			"@_voicelength": string;
			"@_length": string;
			"@_bufid": string;
			"@_aeskey": string;
			"@_voiceurl": string;
			"@_voicemd5": string;
			"@_clientmsgid": string;
			"@_fromusername": string;
		};
	};
}

export default function VoiceMessage({
	message,
	variant = "default",
	...props
}: VoiceMessageProps) {
	const chat = message.chat;
	if (variant === "default")
		return (
			<div className={cn("max-w-[20em]")} {...props}>
				<LocalVoice chat={chat!} message={message} className={""} />
			</div>
		);

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
