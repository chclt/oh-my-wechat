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
import VideoMessage from "@/components/message/video-message.tsx";
import VoiceMessage from "@/components/message/voice-message.tsx";
import VoipMessage from "@/components/message/voip-message.tsx";
import WeComContactMessage from "@/components/message/wecom-contact-message.tsx";
import { MessageDirection, MessageTypeEnum, type MessageType } from "@/schema";
import { ErrorBoundary } from "react-error-boundary";
import { Route } from "@/routes/$accountId/route.tsx";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AccountSuspenseQueryOptions } from "@/lib/fetchers/account.ts";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { CircleQuestionmarkSolid } from "../icon";
import { Card, CardContent, CardFooter, CardIndicator } from "../ui/card";
import type React from "react";

// TODO
export interface MessageProp<Message = MessageType, Variant = undefined> {
	message: Message;
	variant?: "default" | "referenced" | "abstract" | Variant;
	showPhoto?: boolean;
	showUsername?: boolean;
}

export default function Message({
	message,
	variant = "default",
	...props
}: MessageProp & React.HTMLAttributes<HTMLElement>) {
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
		case MessageTypeEnum.TEXT:
			return <TextMessage message={message} variant={variant} {...props} />;

		case MessageTypeEnum.IMAGE:
			return <ImageMessage message={message} variant={variant} {...props} />;

		case MessageTypeEnum.VOICE:
			return <VoiceMessage message={message} variant={variant} {...props} />;

		case MessageTypeEnum.MAIL:
			return <MailMessage message={message} variant={variant} {...props} />;

		case MessageTypeEnum.CONTACT:
			return <ContactMessage message={message} variant={variant} {...props} />;

		case MessageTypeEnum.VIDEO:
			return <VideoMessage message={message} variant={variant} {...props} />;

		case MessageTypeEnum.MICROVIDEO:
			return (
				<MicroVideoMessage message={message} variant={variant} {...props} />
			);

		case MessageTypeEnum.STICKER:
			return <StickerMessage message={message} variant={variant} {...props} />;

		case MessageTypeEnum.LOCATION:
			return <LocationMessage message={message} variant={variant} {...props} />;

		case MessageTypeEnum.APP:
			return <AppMessage message={message} variant={variant} {...props} />;

		case MessageTypeEnum.VOIP:
			return <VoipMessage message={message} variant={variant} {...props} />;

		case MessageTypeEnum.GROUP_VOIP:
			return (
				<ChatroomVoipMessage message={message} variant={variant} {...props} />
			);

		case MessageTypeEnum.WECOM_CONTACT:
			return (
				<WeComContactMessage message={message} variant={variant} {...props} />
			);

		case MessageTypeEnum.SYSTEM:
			return <SystemMessage message={message} variant={variant} {...props} />;

		case MessageTypeEnum.SYSTEM_EXTENDED:
			return (
				<SystemExtendedMessage message={message} variant={variant} {...props} />
			);

		case MessageTypeEnum.OMW_ERROR:
			return (
				<Card className={"max-w-[20em]"} {...props}>
					<CardContent className="p-3">
						<div className={"mt-1 text-pretty text-foreground break-all"}>
							{(message as MessageType).raw_message}
						</div>
					</CardContent>
					<CardFooter>
						解析失败的消息
						<CardIndicator>
							<CircleQuestionmarkSolid className=" scale-[135%]" />
						</CardIndicator>
					</CardFooter>
				</Card>
			);

		default:
			return (
				<Dialog>
					<DialogTrigger className="text-start">
						<Card className={"max-w-[20em]"} {...props}>
							<CardContent className="p-3">
								<div
									className={"mt-1 text-pretty text-mute-foreground break-all"}
								>
									暂未支持的消息类型，点击查看原始数据{" "}
								</div>
							</CardContent>
							<CardFooter>
								未知的消息类型：{(message as MessageType).type}
								<CardIndicator>
									<CircleQuestionmarkSolid className=" scale-[135%]" />
								</CardIndicator>
							</CardFooter>
						</Card>
					</DialogTrigger>
					<DialogContent>
						<ScrollArea className="max-w-full overflow-hidden">
							<pre className="text-sm pb-4">
								{(message as MessageType).raw_message}
							</pre>
							<ScrollBar orientation="horizontal" />
						</ScrollArea>
					</DialogContent>
				</Dialog>
			);
	}
}
