import LiveMessageRecord from "@/components/message-record/live-message-record.tsx";
import dialogClasses from "@/components/ui/dialog.module.css";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type MessageType, RecordTypeEnum } from "@/schema";
import {
	AttachMessageRecordType,
	ChannelMessageRecordType,
	ChannelVideoMessageRecordType,
	ContactMessageRecordType,
	ForwardMessageRecordType,
	ImageMessageRecordType,
	LinkMessageRecordType,
	LiveMessageRecordType,
	LocationMessageRecordType,
	MessageRecordBaseType,
	MiniAppMessageRecordType,
	MusicMessageRecordType,
	NoteMessageRecordType,
	TextMessageRecordType,
	TingMessageRecordType,
	VideoMessageRecordType,
} from "@/schema/message-record.ts";
import { Dialog } from "@base-ui/react";
import type React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CircleQuestionmarkSolid } from "../icon";
import { Card, CardContent, CardFooter, CardIndicator } from "../ui/card";
import AttachMessageRecord from "./attach-message-record.tsx";
import ChannelMessageRecord from "./channel-message-record.tsx";
import ChannelVideoMessageRecord from "./channel-video-message-record.tsx";
import ContactMessageRecord from "./contact-message-record.tsx";
import ForwardMessageRecord from "./forward-message-record.tsx";
import ImageMessageRecord from "./image-message-record.tsx";
import LinkMessageRecord from "./link-message-record.tsx";
import LocationMessageRecord from "./location-message-record.tsx";
import MiniAppMessageRecord from "./mini-app-message-record.tsx";
import MusicMessageRecord from "./music-message-record.tsx";
import NoteMessageRecord from "./note-message-record.tsx";
import TextMessageRecord from "./text-message-record.tsx";
import TingMessageRecord from "./ting-message-record.tsx";
import VideoMessageRecord from "./video-message-record.tsx";

/**
 * 合并转发的消息内容、笔记中的内容，都是一个 Record 资源
 */

interface RecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: MessageRecordBaseType;
	variant?: "default" | "note" | string; // 笔记消息中的记录需要不同样式
}

export default function MessageRecord({
	message,
	record,
	variant = "default",
	...props
}: RecordProps) {
	return (
		<ErrorBoundary
			onError={(error) => {
				console.error(error, record);
			}}
			fallback={<div>Error</div>}
		>
			<MessageRecordComponent
				message={message}
				record={record}
				variant={variant}
				onDoubleClick={(event) => {
					if (import.meta.env.DEV) console.log(record);
					event.preventDefault();
					event.stopPropagation();
				}}
				{...props}
			/>
		</ErrorBoundary>
	);
}

function MessageRecordComponent({
	message,
	record,
	variant = "default",
	...props
}: RecordProps) {
	switch (record["@_datatype"]) {
		case RecordTypeEnum.TEXT:
			return (
				<TextMessageRecord
					message={message}
					record={record as unknown as TextMessageRecordType}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.IMAGE:
			return (
				<ImageMessageRecord
					message={message}
					record={record as unknown as ImageMessageRecordType}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.VIDEO:
			return (
				<VideoMessageRecord
					message={message}
					record={record as unknown as VideoMessageRecordType}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.LINK:
			return (
				<LinkMessageRecord
					message={message}
					record={record as unknown as LinkMessageRecordType}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.LOCATION:
			return (
				<LocationMessageRecord
					message={message}
					record={record as unknown as LocationMessageRecordType}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.ATTACH:
			return (
				<AttachMessageRecord
					message={message}
					record={record as unknown as AttachMessageRecordType}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.CONTACT:
			return (
				<ContactMessageRecord
					message={message}
					record={record as unknown as ContactMessageRecordType}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.FORWARD_MESSAGE:
			return (
				<ForwardMessageRecord
					message={message}
					record={record as unknown as ForwardMessageRecordType}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.MINIAPP:
			return (
				<MiniAppMessageRecord
					message={message}
					record={record as unknown as MiniAppMessageRecordType}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.NOTE:
			return (
				<NoteMessageRecord
					message={message}
					record={record as unknown as NoteMessageRecordType}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.CHANNEL_VIDEO:
			return (
				<ChannelVideoMessageRecord
					message={message}
					record={record as unknown as ChannelVideoMessageRecordType}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.LIVE:
			return (
				<LiveMessageRecord
					message={message}
					record={record as unknown as LiveMessageRecordType}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.CHANNEL:
			return (
				<ChannelMessageRecord
					message={message}
					record={record as unknown as ChannelMessageRecordType}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.MUSIC:
			return (
				<MusicMessageRecord
					message={message}
					record={record as unknown as MusicMessageRecordType}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.TING:
			return (
				<TingMessageRecord
					message={message}
					record={record as unknown as TingMessageRecordType}
					variant={variant}
					{...props}
				/>
			);
		default:
			// 观察到，当遇到第四层转发消息，微信客户端会显示“This message cannot be displayed”, 同时这条 record 没有 @_datatype 字段，但 datadesc 里仍然有部分摘要信息，对于用户来说可用程度有限
			if (variant === "default") {
				return (
					<Dialog.Root>
						<Dialog.Trigger className="text-start">
							<Card className={"max-w-[20em]"} {...props}>
								<CardContent className="p-3">
									<div
										className={
											"mt-1 text-pretty text-mute-foreground break-all"
										}
									>
										{record["@_datatype"]
											? "暂未支持的转发消息类型，点击查看原始数据"
											: "也许因为转发消息层级过深，这条消息无法完整展示，点击查看原始数据"}
									</div>
								</CardContent>
								<CardFooter>
									{record["@_datatype"] ? record["@_datatype"] : "\u200B"}
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
											{JSON.stringify(record, null, 2)}
										</pre>
									</div>
								</ScrollArea>
							</Dialog.Popup>
						</Dialog.Portal>
					</Dialog.Root>
				);
			} else {
				return "";
			}
	}
}
