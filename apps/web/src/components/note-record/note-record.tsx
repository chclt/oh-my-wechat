import dialogClasses from "@/components/ui/dialog.module.css";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { cn } from "@/lib/utils.ts";
import {
	AttachNoteRecordType,
	AudioNoteRecordType,
	ImageNoteRecordType,
	LocationNoteRecordType,
	NoteRecordType,
	OpenMessageType,
	RecordTypeEnum,
	VideoNoteRecordType,
} from "@/schema";
import { NoteOpenMessageEntity } from "@/schema/open-message.ts";
import { Dialog } from "@base-ui-components/react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import AttachNoteRecord from "./attach-note-record.tsx";
import AudioNoteRecord from "./audio-note-record.tsx";
import ImageNoteRecord from "./image-note-record.tsx";
import LocationNoteRecord from "./location-note-record.tsx";
import VideoNoteRecord from "./video-note-record.tsx";

interface NoteRecordProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<NoteOpenMessageEntity>;
	recordEntity: NoteRecordType;
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
						if (import.meta.env.DEV) console.log(recordEntity);
					}}
				>
					解析失败的笔记内容
				</div>
			}
		>
			<Suspense>
				<NoteRecordComponent
					message={message}
					recordEntity={recordEntity}
					className={className}
					onDoubleClick={(event) => {
						if (import.meta.env.DEV) {
							event.preventDefault();
							event.stopPropagation();
							console.log(message);
						}
					}}
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
					recordEntity={recordEntity as ImageNoteRecordType}
					{...props}
				/>
			);

		case RecordTypeEnum.AUDIO:
			return (
				<AudioNoteRecord
					message={message}
					recordEntity={recordEntity as AudioNoteRecordType}
					{...props}
				/>
			);
		case RecordTypeEnum.ATTACH:
			return (
				<AttachNoteRecord
					message={message}
					recordEntity={recordEntity as AttachNoteRecordType}
					{...props}
				/>
			);
		case RecordTypeEnum.VIDEO:
			return (
				<VideoNoteRecord
					message={message}
					recordEntity={recordEntity as VideoNoteRecordType}
					{...props}
				/>
			);
		case RecordTypeEnum.LOCATION:
			return (
				<LocationNoteRecord
					recordEntity={recordEntity as LocationNoteRecordType}
					{...props}
				/>
			);
		default: {
			const { className, ...restProps } = props;
			return (
				<Dialog.Root>
					<Dialog.Trigger
						className={cn(
							"block w-full text-start py-3 px-3 text-muted-foreground bg-muted",
							className,
						)}
						{...restProps}
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
							<ScrollArea className="size-full overflow-hidden">
								<div className="p-4">
									<pre className="w-full text-sm pb-4 break-all whitespace-break-spaces">
										{JSON.stringify(recordEntity, null, 2)}
									</pre>
								</div>
							</ScrollArea>
						</Dialog.Popup>
					</Dialog.Portal>
				</Dialog.Root>
			);
		}
	}
}
