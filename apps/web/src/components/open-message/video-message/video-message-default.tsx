import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import { LinkCard } from "@/components/link-card.tsx";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import { decodeUnicodeReferences } from "@/lib/utils.ts";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import type { VideoMessageProps } from "./types";
import { useAccount } from "@/components/account-provider.tsx";

export function VideoMessageDefault({ message, ...props }: VideoMessageProps) {
	const { accountId } = useAccount();

	const { ref: imageRef, inViewport } = useInViewport();

	const { data: image } = useQuery({
		...MessageImageQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
			domain: "opendata",
		}),
		enabled: inViewport,
	});

	const heading = decodeUnicodeReferences(
		message.message_entity.msg.appmsg.title,
	);
	const preview = message.message_entity.msg.appmsg.appattach.cdnthumbmd5 ? (
		<AutoResolutionFallbackImage ref={imageRef} image={image} alt={heading} />
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
