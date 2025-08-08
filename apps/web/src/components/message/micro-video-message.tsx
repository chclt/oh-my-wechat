import LocalVideo from "@/components/local-video.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import type { MessageProp } from "@/components/message/message.tsx";
import type { MicroVideoMessageType } from "@/schema";

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
	const chat = message.chat;
	if (variant === "default")
		return (
			<div className="" {...props}>
				<LocalVideo chat={chat!} message={message} />
			</div>
		);

	return (
		<MessageInlineWrapper message={message} {...props}>
			[视频]
		</MessageInlineWrapper>
	);
}
