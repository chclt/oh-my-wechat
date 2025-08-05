import AppMessage from "@/components/message/app-message.tsx";
import ChatroomVoipMessage from "@/components/message/chatroom-voip-message.tsx";
import ContactMessage from "@/components/message/contact-message.tsx";
import ImageMessage from "@/components/message/image-message.tsx";
import LocationMessage from "@/components/message/location-message.tsx";
import MailMessage from "@/components/message/mail-message.tsx";
import MicroVideoMessage from "@/components/message/micro-video-message.tsx";
import StickerMessage from "@/components/message/sticker-message.tsx";
import SystemExtendedMessage from "@/components/message/system-extended-message.tsx";
import SystemMessage from "@/components/message/system-message.tsx";
import TextMessage from "@/components/message/text-message.tsx";
import VerityMessage from "@/components/message/verify-message.tsx";
import VideoMessage from "@/components/message/video-message.tsx";
import VoiceMessage from "@/components/message/voice-message.tsx";
import VoipMessage from "@/components/message/voip-message.tsx";
import WeComContactMessage from "@/components/message/wecom-contact-message.tsx";
import { MessageDirection, MessageType, type MessageVM } from "@/lib/schema.ts";
import { formatDateTime } from "@/lib/utils.ts";
import { ErrorBoundary } from "react-error-boundary";
import { Route } from "@/routes/$accountId/route.tsx";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AccountSuspenseQueryOptions } from "@/lib/fetchers/account.ts";

export interface MessageProp<T = MessageVM>
	extends React.HTMLAttributes<HTMLDivElement> {
	message: T;
	variant?: "default" | "referenced" | "abstract";
	showPhoto?: boolean;
	showUsername?: boolean;
	[key: string]: unknown;
}

export default function Message({
	message,
	variant = "default",
	...props
}: MessageProp) {
	const { accountId } = Route.useParams();
	const { data: account } = useSuspenseQuery(
		AccountSuspenseQueryOptions(accountId),
	);

	if (message.direction === MessageDirection.outgoing && account)
		message.from = account;

	return (
		<ErrorBoundary
			onError={(e) => {
				console.error(e);
			}}
			fallback={
				<div
					onDoubleClick={() => {
						if (import.meta.env.DEV) console.log(message);
					}}
				>
					解析失败的消息
				</div>
			}
		>
			<MessageComponent
				onDoubleClick={() => {
					if (import.meta.env.DEV) console.log(message);
				}}
				message={message}
				variant={variant}
				{...props}
			/>
		</ErrorBoundary>
	);
}

function MessageComponent({ message, variant, ...props }: MessageProp) {
	switch (message.type) {
		case MessageType.TEXT:
			return <TextMessage message={message} variant={variant} {...props} />;

		case MessageType.IMAGE:
			return <ImageMessage message={message} variant={variant} {...props} />;

		case MessageType.VOICE:
			return <VoiceMessage message={message} variant={variant} {...props} />;

		case MessageType.MAIL:
			return <MailMessage message={message} variant={variant} {...props} />;

		case MessageType.VERITY:
			return <VerityMessage message={message} variant={variant} {...props} />;

		case MessageType.CONTACT:
			return <ContactMessage message={message} variant={variant} {...props} />;

		case MessageType.VIDEO:
			return <VideoMessage message={message} variant={variant} {...props} />;

		case MessageType.MICROVIDEO:
			return (
				<MicroVideoMessage message={message} variant={variant} {...props} />
			);

		case MessageType.STICKER:
			return <StickerMessage message={message} variant={variant} {...props} />;

		case MessageType.LOCATION:
			return <LocationMessage message={message} variant={variant} {...props} />;

		case MessageType.APP:
			return <AppMessage message={message} variant={variant} {...props} />;

		case MessageType.VOIP:
			return <VoipMessage message={message} variant={variant} {...props} />;

		case MessageType.GROUP_VOIP:
			return (
				<ChatroomVoipMessage message={message} variant={variant} {...props} />
			);

		case MessageType.WECOM_CONTACT:
			return (
				<WeComContactMessage message={message} variant={variant} {...props} />
			);

		case MessageType.SYSTEM:
			return <SystemMessage message={message} variant={variant} {...props} />;

		case MessageType.SYSTEM_EXTENDED:
			return (
				<SystemExtendedMessage message={message} variant={variant} {...props} />
			);

		default:
			return (
				<div {...props}>解析失败的消息: {(message as MessageVM).type}</div>
			);
	}
}
