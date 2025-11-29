import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { MessageProp } from "@/components/message/message.tsx";
import { MessageVoiceQueryOptions } from "@/lib/fetchers";
import { cn } from "@/lib/utils.ts";
import type { VoiceMessageType } from "@/schema";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";

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
	if (variant === "default") {
		return <VoiceMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <VoiceMessageAbstract message={message} {...props} />;
	}
}

function VoiceMessageDefault({
	message,
	...props
}: Omit<VoiceMessageProps, "variant">) {
	const { ref: voiceRef, inViewport } = useInViewport();

	const { data: voice } = useQuery({
		...MessageVoiceQueryOptions({
			account: { id: "" },
			chat: { id: message.chat_id },
			message,
		}),
		enabled: inViewport,
	});

	return (
		<div className={cn("max-w-[20em]")} {...props}>
			<audio
				ref={voiceRef}
				src={voice?.src}
				controls
				// width={result?.[0]?.width}
				// height={result?.[0]?.height}
			/>
		</div>
	);
}

function VoiceMessageAbstract({
	message,
	...props
}: Omit<VoiceMessageProps, "variant">) {
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
