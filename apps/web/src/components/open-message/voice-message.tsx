import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import UrlMessage from "@/components/open-message/url-message.tsx";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import type { OpenMessageType } from "@/schema";
import {
	UrlOpenMessageEntity,
	VoiceOpenMessageEntity,
} from "@/schema/open-message.ts";

type VoiceMessageProps = OpenMessageProps<VoiceOpenMessageEntity>;

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
	return (
		<UrlMessage
			message={message as unknown as OpenMessageType<UrlOpenMessageEntity>}
			variant="default"
			{...props}
		/>
	);
}

function VoiceMessageAbstract({
	message,
	...props
}: Omit<VoiceMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[音频] {decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
		</MessageInlineWrapper>
	);
}
