import {
	ChatroomVoipMessage,
	ContactMessage,
	ImageMessage,
	LocationMessage,
	MailMessage,
	MicroVideoMessage,
	StickerMessage,
	SystemExtendedMessage,
	SystemMessage,
	TextMessage,
	VideoMessage,
	VoiceMessage,
	VoipMessage,
	WeComContactMessage,
} from "@/components/message";
import OpenMessage from "@/components/open-message/open-message.tsx";
import dialogClasses from "@/components/ui/dialog.module.css";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AccountSuspenseQueryOptions } from "@/lib/fetchers/account.ts";
import { cn } from "@/lib/utils.ts";
import { Route } from "@/routes/$accountId/route.tsx";
import { MessageDirection, MessageTypeEnum, type MessageType } from "@/schema";
import { Dialog } from "@base-ui/react";
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
			return (
				<TextMessage.Auto message={message} variant={variant} {...props} />
			);

		case MessageTypeEnum.IMAGE:
			return (
				<ImageMessage.Auto message={message} variant={variant} {...props} />
			);

		case MessageTypeEnum.VOICE:
			return (
				<VoiceMessage.Auto message={message} variant={variant} {...props} />
			);

		case MessageTypeEnum.MAIL:
			return (
				<MailMessage.Auto message={message} variant={variant} {...props} />
			);

		case MessageTypeEnum.CONTACT:
			return (
				<ContactMessage.Auto message={message} variant={variant} {...props} />
			);

		case MessageTypeEnum.VIDEO:
			return (
				<VideoMessage.Auto message={message} variant={variant} {...props} />
			);

		case MessageTypeEnum.MICROVIDEO:
			return (
				<MicroVideoMessage.Auto
					message={message}
					variant={variant}
					{...props}
				/>
			);

		case MessageTypeEnum.STICKER:
			return (
				<StickerMessage.Auto message={message} variant={variant} {...props} />
			);

		case MessageTypeEnum.LOCATION:
			return (
				<LocationMessage.Auto message={message} variant={variant} {...props} />
			);

		case MessageTypeEnum.APP:
			return <OpenMessage message={message} variant={variant} {...props} />;

		case MessageTypeEnum.VOIP:
			return (
				<VoipMessage.Auto message={message} variant={variant} {...props} />
			);

		case MessageTypeEnum.GROUP_VOIP:
			return (
				<ChatroomVoipMessage.Auto
					message={message}
					variant={variant}
					{...props}
				/>
			);

		case MessageTypeEnum.WECOM_CONTACT:
			return (
				<WeComContactMessage.Auto
					message={message}
					variant={variant}
					{...props}
				/>
			);

		case MessageTypeEnum.SYSTEM:
			return (
				<SystemMessage.Auto message={message} variant={variant} {...props} />
			);

		case MessageTypeEnum.SYSTEM_EXTENDED:
			return (
				<SystemExtendedMessage.Auto
					message={message}
					variant={variant}
					{...props}
				/>
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
