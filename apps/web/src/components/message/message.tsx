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
import dialogClasses from "@/components/ui/dialog.module.css";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AccountSuspenseQueryOptions } from "@/lib/fetchers/account.ts";
import { cn } from "@/lib/utils.ts";
import { Route } from "@/routes/$accountId/route.tsx";
import { MessageDirection, MessageTypeEnum, type MessageType } from "@/schema";
import { Dialog } from "@base-ui-components/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import type React from "react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CircleQuestionmarkSolid } from "../icon";
import { Card, CardContent, CardFooter, CardIndicator } from "../ui/card";

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
		AccountSuspenseQueryOptions({ account: { id: accountId } }),
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
			<Suspense>
				<MessageComponent
					onDoubleClick={() => {
						if (import.meta.env.DEV) console.log(message);
					}}
					message={message}
					variant={variant}
					{...props}
				/>
			</Suspense>
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
				<Dialog.Root>
					<Dialog.Trigger className="text-start">
						<Card className={"max-w-[20em]"} {...props}>
							<CardContent className="p-3">
								<div
									className={"mt-1 text-pretty text-mute-foreground break-all"}
								>
									暂未支持的消息类型，点击查看原始数据
								</div>
							</CardContent>
							<CardFooter>
								未知的消息类型：{(message as MessageType).type}
								<CardIndicator>
									<CircleQuestionmarkSolid className=" scale-[135%]" />
								</CardIndicator>
							</CardFooter>
						</Card>
					</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Backdrop className={dialogClasses.Backdrop} />
						<Dialog.Popup
							className={cn(
								dialogClasses.Popup,
								"w-md max-h-[calc(100%-6rem)] h-96",
							)}
						>
							<ScrollArea className="size-full overflow-hidden">
								<div className="p-4">
									<pre className="w-full text-sm pb-4 break-all whitespace-break-spaces">
										{(message as MessageType).raw_message}
									</pre>
								</div>
							</ScrollArea>
						</Dialog.Popup>
					</Dialog.Portal>
				</Dialog.Root>
			);
	}
}
