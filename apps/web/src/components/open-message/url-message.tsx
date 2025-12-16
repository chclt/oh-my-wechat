import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import Image from "@/components/image.tsx";
import { LinkCard } from "@/components/link-card.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import { Route } from "@/routes/$accountId/route.tsx";
import { UrlOpenMessageEntity } from "@/schema/open-message.ts";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";

type UrlMessageProps = OpenMessageProps<UrlOpenMessageEntity>;

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
	const { accountId } = Route.useParams();

	const { ref: imageRef, inViewport } = useInViewport();

	const { data: image } = useQuery({
		...MessageImageQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
			domain: "opendata",
		}),
		enabled:
			inViewport &&
			!message.message_entity.msg.appmsg.thumburl &&
			!!message.message_entity.msg.appmsg.appattach.cdnthumbmd5,
	});

	const heading = decodeUnicodeReferences(
		message.message_entity.msg.appmsg.title,
	);

	const preview =
		(message.message_entity.msg.appmsg.thumburl ? (
			<Image src={message.message_entity.msg.appmsg.thumburl} alt={heading} />
		) : undefined) ??
		(message.message_entity.msg.appmsg.appattach.cdnthumbmd5 ? (
			<AutoResolutionFallbackImage ref={imageRef} image={image} alt={heading} />
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
