import { LinkCard } from "@/components/link-card.tsx";
import LocalImage from "@/components/local-image.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import type { AppMessageTypeEnum } from "@/schema";

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
	if (variant === "default") {
		return <VideoMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <VideoMessageAbstract message={message} {...props} />;
	}
}

function VideoMessageDefault({
	message,
	...props
}: Omit<VideoMessageProps, "variant">) {
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
}

function VideoMessageAbstract({
	message,
	...props
}: Omit<VideoMessageProps, "variant">) {
	const heading = decodeUnicodeReferences(
		message.message_entity.msg.appmsg.title,
	);

	return (
		<MessageInlineWrapper message={message} {...props}>
			[链接] {heading}
		</MessageInlineWrapper>
	);
}
