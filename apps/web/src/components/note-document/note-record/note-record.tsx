import { NoteMessageEntity } from "@/components/message/app-message/note-message";

import { cn } from "@/lib/utils";
import {
	AppMessageType,
	NoteAttachRecordEntity,
	NoteAudioRecordEntity,
	NoteImageRecordEntity,
	NoteLocationRecordEntity,
	NoteRecordEntity,
	NoteVideoRecordEntity,
	RecordTypeEnum,
} from "@/schema";
import { Dialog, ScrollArea } from "@base-ui-components/react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import AttatchNoteRecord from "./attatch-note-record";
import AudioNoteRecord from "./audio-note-record";
import ImageNoteRecord from "./image-note-record";
import LocationNoteRecord from "./location-note-record";
import VideoNoteRecord from "./video-note-record";

import dialogClasses from "@/components/ui/dialog.module.css";
import scrollAreaClasses from "@/components/ui/scroll-area.module.css";

interface NoteRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: AppMessageType<NoteMessageEntity>;
	recordEntity: NoteRecordEntity;
}

export default function NoteRecord({
	message,
	recordEntity,
	className,
	...props
}: NoteRecordProps) {
	return (
		<ErrorBoundary
			onError={(e) => {
				console.error(e);
			}}
			fallback={
				<div
					className={cn(
						"w-full py-3 px-3 text-muted-foreground bg-muted",
						className,
					)}
					onDoubleClick={() => {
						if (import.meta.env.DEV) console.log(message);
					}}
				>
					解析失败的笔记内容
				</div>
			}
		>
			<Suspense>
				<NoteRecordComponent
					onDoubleClick={() => {
						if (import.meta.env.DEV) console.log(message);
					}}
					message={message}
					recordEntity={recordEntity}
					className={className}
					{...props}
				/>
			</Suspense>
		</ErrorBoundary>
	);
}

function NoteRecordComponent({
	message,
	recordEntity,
	...props
}: NoteRecordProps) {
	switch (recordEntity["@_datatype"]) {
		case RecordTypeEnum.IMAGE:
			return (
				<ImageNoteRecord
					message={message}
					recordEntity={recordEntity as NoteImageRecordEntity}
					{...props}
				/>
			);

		case RecordTypeEnum.AUDIO:
			return (
				<AudioNoteRecord
					message={message}
					recordEntity={recordEntity as NoteAudioRecordEntity}
					{...props}
				/>
			);
		case RecordTypeEnum.ATTACH:
			return (
				<AttatchNoteRecord
					message={message}
					recordEntity={recordEntity as NoteAttachRecordEntity}
					{...props}
				/>
			);
		case RecordTypeEnum.VIDEO:
			return (
				<VideoNoteRecord
					message={message}
					recordEntity={recordEntity as NoteVideoRecordEntity}
					{...props}
				/>
			);
		case RecordTypeEnum.LOCATION:
			return (
				<LocationNoteRecord
					recordEntity={recordEntity as NoteLocationRecordEntity}
					{...props}
				/>
			);
		default: {
			const { className, ...rest } = props;
			return (
				<Dialog.Root>
					<Dialog.Trigger
						className={cn(
							"block w-full text-start py-3 px-3 text-muted-foreground bg-muted",
							className,
						)}
						{...rest}
					>
						暂未支持的笔记内容，点击查看原始数据
					</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Backdrop className={dialogClasses.Backdrop} />
						<Dialog.Popup
							className={cn(
								dialogClasses.Popup,
								"w-md max-h-[calc(100%-6rem)] h-96",
							)}
						>
							<ScrollArea.Root className="h-full overflow-hidden">
								<ScrollArea.Viewport className={scrollAreaClasses.Viewport}>
									<ScrollArea.Content
										className={cn(scrollAreaClasses.Content, "p-4 w-full")}
									>
										<pre className="w-full text-sm pb-4 break-all whitespace-break-spaces">
											{JSON.stringify(recordEntity, null, 2)}
										</pre>
									</ScrollArea.Content>
								</ScrollArea.Viewport>
								<ScrollArea.Scrollbar
									className={cn(scrollAreaClasses.Scrollbar)}
								>
									<ScrollArea.Thumb className={scrollAreaClasses.Thumb} />
								</ScrollArea.Scrollbar>
							</ScrollArea.Root>
						</Dialog.Popup>
					</Dialog.Portal>
				</Dialog.Root>
			);
		}
	}
}
