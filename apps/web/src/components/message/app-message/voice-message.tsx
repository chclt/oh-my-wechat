import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import UrlMessage, {
	type UrlMessageEntity,
} from "@/components/message/app-message/url-message.tsx";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import type { AppMessageType, AppMessageTypeEnum } from "@/schema";

export interface VoiceMessageEntity {
	type: AppMessageTypeEnum.VOICE;
	title: string;
	des: string;
	username: string;
	action: string;
	url: string;
	lowurl: string;
	dataurl: string;
	lowdataurl: string;
	statextstr: string;
	songalbumurl: string;
	songlyric: string;
	musicShareItem: {
		mvCoverUrl: string;
		musicDuration: number;
		mid: string;
	};
}

type VoiceMessageProps = AppMessageProps<VoiceMessageEntity>;

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
			message={message as unknown as AppMessageType<UrlMessageEntity>}
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
