import LiveRecord, {
	type LiveRecordEntity,
} from "@/components/record/live-record.tsx";
import dialogClasses from "@/components/ui/dialog.module.css";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { type MessageType, RecordTypeEnum } from "@/schema";
import { Dialog } from "@base-ui-components/react";
import type React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CircleQuestionmarkSolid } from "../icon";
import { Card, CardContent, CardFooter, CardIndicator } from "../ui/card";
import AttatchRecord, { type AttatchRecordEntity } from "./attatch-record";
import ChannelRecord, { type ChannelRecordEntity } from "./channel-record";
import ChannelVideoRecord, {
	type ChannelVideoRecordEntity,
} from "./channel-video-record";
import ContactRecord, { type ContactRecordEntity } from "./contact-record";
import ForwardMessageRecord, {
	type ForwardMessageRecordEntity,
} from "./forward-record";
import ImageRecord, { type ImageRecordEntity } from "./image-record";
import LinkRecord, { type LinkRecordEntity } from "./link-record";
import LocationRecord, { type LocationRecordEntity } from "./location-record";
import MiniAppRecord, { type MiniAppRecordEntity } from "./miniapp-record";
import MusicRecord, { type MusicRecordEntity } from "./music-record";
import NoteRecord, { type NoteRecordEntity } from "./note-record";
import TextRecord, { type TextRecordEntity } from "./text-record";
import TingRecord, { type TingRecordEntity } from "./ting-record";

/**
 * 合并转发的消息内容、笔记中的内容，都是一个 Record 资源
 */

interface RecordProps extends React.HTMLAttributes<HTMLDivElement> {
	message: MessageType;
	record: RecordType;
	variant?: "default" | "note" | string; // 笔记消息中的记录需要不同样式
}

export interface RecordType {
	"@_datatype": RecordTypeEnum;
	"@_dataid": string;
}

export default function Record({
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
			<RecordComponent
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

function RecordComponent({
	message,
	record,
	variant = "default",
	...props
}: RecordProps) {
	switch (record["@_datatype"]) {
		case RecordTypeEnum.TEXT:
			return (
				<TextRecord
					message={message}
					record={record as unknown as TextRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.IMAGE:
			return (
				<ImageRecord
					message={message}
					record={record as unknown as ImageRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		// TODO
		// case RecordTypeEnum.VIDEO:
		// 	return "视频";
		case RecordTypeEnum.LINK:
			return (
				<LinkRecord
					message={message}
					record={record as unknown as LinkRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.LOCATION:
			return (
				<LocationRecord
					message={message}
					record={record as unknown as LocationRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.ATTACH:
			return (
				<AttatchRecord
					message={message}
					record={record as unknown as AttatchRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.CONTACT:
			return (
				<ContactRecord
					message={message}
					record={record as unknown as ContactRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.FORWARD_MESSAGE:
			return (
				<ForwardMessageRecord
					message={message}
					record={record as unknown as ForwardMessageRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.MINIAPP:
			return (
				<MiniAppRecord
					message={message}
					record={record as unknown as MiniAppRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.NOTE:
			return (
				<NoteRecord
					message={message}
					record={record as unknown as NoteRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.CHANNEL_VIDEO:
			return (
				<ChannelVideoRecord
					message={message}
					record={record as unknown as ChannelVideoRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.LIVE:
			return (
				<LiveRecord
					message={message}
					record={record as unknown as LiveRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.CHANNEL:
			return (
				<ChannelRecord
					message={message}
					record={record as unknown as ChannelRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.MUSIC:
			return (
				<MusicRecord
					message={message}
					record={record as unknown as MusicRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordTypeEnum.TING:
			return (
				<TingRecord
					message={message}
					record={record as unknown as TingRecordEntity}
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
