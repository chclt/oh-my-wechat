import { LinkCard } from "@/components/link-card.tsx";
import LocalImage from "@/components/local-image.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import type { AppMessageTypeEnum } from "@/lib/schema.ts";
import { decodeUnicodeReferences } from "@/lib/utils.ts";

export interface VideoMessageEntity {
	type: AppMessageTypeEnum.VIDEO;
	title: string;
	des: string;
	url: string;
	lowurl: string;
	appattach: {
		totallen: number;
		attachid: string;
		emoticonmd5: string;
		fileext: string;
		cdnthumburl: string;
		cdnthumbmd5: string;
		cdnthumblength: number;
		cdnthumbwidth: number;
		cdnthumbheight: number;
		cdnthumbaeskey: string;
		aeskey: string;
		encryver: 0 | 1;
		filekey: string;
	};
}

type VideoMessageProps = AppMessageProps<VideoMessageEntity>;

export default function VideoMessage({
	message,
	variant = "default",
	...props
}: VideoMessageProps) {
	const chat = message.chat;
	const heading = decodeUnicodeReferences(
		message.message_entity.msg.appmsg.title,
	);
	const preview = message.message_entity.msg.appmsg.appattach.cdnthumbmd5 ? (
		<LocalImage
			chat={chat!}
			message={message}
			domain="opendata"
			alt={heading}
		/>
	) : undefined;

	if (variant === "default")
		return (
			<LinkCard
				href={message.message_entity.msg.appmsg.url}
				heading={heading}
				abstract={message.message_entity.msg.appmsg.des}
				preview={preview}
				from={
					message.message_entity.msg.appinfo?.appname ??
					message.message_entity.msg?.appinfo?.appname
				}
				{...props}
			/>
		);

	return (
		<MessageInlineWrapper message={message} {...props}>
			[链接] {heading}
		</MessageInlineWrapper>
	);
}
