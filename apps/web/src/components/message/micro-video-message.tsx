import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { MessageProp } from "@/components/message/message.tsx";
import { MessageVideoQueryOptions } from "@/lib/fetchers";
import { Route } from "@/routes/$accountId/route.tsx";
import type { MicroVideoMessageType } from "@/schema";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";

type MicroVideoMessageProps = MessageProp<MicroVideoMessageType>;

export interface MicroVideoMessageEntity {
	msg: {
		videomsg: {
			"@_clientmsgid": string;
			"@_playlength": string;
			"@_length": string;
			"@_type": string;
			"@_status": string;
			"@_fromusername": string;
			"@_aeskey": string;
			"@_cdnvideourl": string;
			"@_cdnthumburl": string;
			"@_cdnthumblength": string;
			"@_cdnthumbwidth": string;
			"@_cdnthumbheight": string;
			"@_cdnthumbaeskey": string;
			"@_encryver": string;
			"@_isplaceholder": string;
			"@_rawlength": string;
			"@_cdnrawvideourl": string;
			"@_cdnrawvideoaeskey": string;
		};
	};
}

export default function MicroVideoMessage({
	message,
	variant = "default",
	...props
}: MicroVideoMessageProps) {
	if (variant === "default") {
		return <MicroVideoMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <MicroVideoMessageAbstract message={message} {...props} />;
	}
}

function MicroVideoMessageDefault({
	message,
	...props
}: Omit<MicroVideoMessageProps, "variant">) {
	const { accountId } = Route.useParams();

	const { ref: videoRef, inViewport } = useInViewport();

	const { data: video } = useQuery({
		enabled: inViewport,
		...MessageVideoQueryOptions({
			account: { id: accountId },
			chat: { id: message.chat_id },
			message,
		}),
	});

	return (
		<div {...props}>
			<video
				ref={videoRef}
				src={video?.src}
				poster={video?.cover?.src}
				controls
				// width={result?.[0]?.width}
				// height={result?.[0]?.height}
			/>
		</div>
	);
}

function MicroVideoMessageAbstract({
	message,
	...props
}: Omit<MicroVideoMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[视频]
		</MessageInlineWrapper>
	);
}
