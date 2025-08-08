import type { AppMessageProps } from "@/components/message/app-message.tsx";
import UrlMessage, {
	type UrlMessageEntity,
} from "@/components/message/app-message/url-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import type { AppMessageTypeEnum, AppMessageType } from "@/schema";
import { decodeUnicodeReferences } from "@/lib/utils.ts";

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
		return (
			<UrlMessage
				message={message as unknown as AppMessageType<UrlMessageEntity>}
				variant={variant}
				{...props}
			/>
		);
	}
	return (
		<MessageInlineWrapper message={message} {...props}>
			[音频] {decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
		</MessageInlineWrapper>
	);
}
