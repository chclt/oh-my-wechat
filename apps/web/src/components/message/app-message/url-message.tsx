import Image from "@/components/image.tsx";
import { LinkCard } from "@/components/link-card";
import LocalImage from "@/components/local-image.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import type { AppMessageTypeEnum } from "@/schema";

export interface UrlMessageEntity {
	type: AppMessageTypeEnum.URL;
	title: string;
	des?: string;
	username: string;
	action: string;
	content: string;
	url: string;
	lowurl: string;
	forwardflag: number;
	dataurl: string;
	lowdataurl: string;
	contentattr: number;
	streamvideo: {
		appattach: {
			attachid: string;
			cdnthumburl: string;
			cdnthumbmd5: string;
			cdnthumblength: number;
			cdnthumbheight: number;
			cdnthumbwidth: number;
			cdnthumbaeskey: string;
			aeskey: string;
			encryver: number;
			fileext: string;
			islargefilemsg: number;
		};
		extinfo: string;
		androidsource: number;
		md5: string;
	};
	appattach: {
		attachid: string;
		cdnthumburl: string;
		cdnthumbmd5: string;
		cdnthumblength: number;
		cdnthumbheight: number;
		cdnthumbwidth: number;
		cdnthumbaeskey: string;
		aeskey: string;
		encryver: number;
		fileext: string;
		islargefilemsg: number;
	};
	extinfo: string;
	androidsource: number;
	sourceusername: string;
	sourcedisplayname?: string;
	commenturl: string;
	thumburl?: string;
	mediatagname: string;
	messageaction: string;
	messageext: string;
	emotionpageshared: {
		webviewshared: {
			shareUrlOriginal: string;
			shareUrlOpen: string;
			jsAppId: string;
			publisherId: string;
		};
		template_id: string;
		md5: string;
		weappinfo: {
			username: string;
			appid: string;
			appservicetype: number;
			secflagforsinglepagemode: number;
			videopageinfo: {
				thumbwidth: number;
				thumbheight: number;
				fromopensdk: number;
			};
		};
	};
}

type UrlMessageProps = AppMessageProps<UrlMessageEntity>;

export default function UrlMessage({
	message,
	variant = "default",
	...props
}: UrlMessageProps) {
	if (variant === "default") {
		return <UrlMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <UrlMessageAbstract message={message} {...props} />;
	}
}

function UrlMessageDefault({
	message,
	...props
}: Omit<UrlMessageProps, "variant">) {
	const heading = decodeUnicodeReferences(
		message.message_entity.msg.appmsg.title,
	);

	const preview =
		(message.message_entity.msg.appmsg.thumburl ? (
			<Image src={message.message_entity.msg.appmsg.thumburl} alt={heading} />
		) : undefined) ??
		(message.message_entity.msg.appmsg.appattach.cdnthumbmd5 ? (
			<LocalImage message={message} domain="opendata" alt={heading} />
		) : undefined);

	return (
		<LinkCard
			href={message.message_entity.msg.appmsg.url}
			heading={heading}
			abstract={message.message_entity.msg.appmsg.des}
			preview={preview}
			from={
				// 偶尔 sourcedisplayname 是一个空字符串，会被 ?? 判定为有效，目前发现这种情况在“服务消息”里出现，但是服务消息本来就应该是另一个 UI，所以暂时先不处理了
				message.message_entity.msg.appmsg.sourcedisplayname ??
				message.message_entity.msg?.appinfo?.appname
			}
			{...props}
		/>
	);
}

function UrlMessageAbstract({
	message,
	...props
}: Omit<UrlMessageProps, "variant">) {
	const heading = decodeUnicodeReferences(
		message.message_entity.msg.appmsg.title,
	);

	return (
		<MessageInlineWrapper message={message} {...props}>
			[链接] {heading}
		</MessageInlineWrapper>
	);
}
