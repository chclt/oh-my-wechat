import { NoteMessageEntity } from "@/components/message/app-message/note-message";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import { ErrorBoundary } from "react-error-boundary";
import AttatchNoteRecord from "./attatch-note-record";
import AudioNoteRecord from "./audio-note-record";
import ImageNoteRecord from "./image-note-record";
import LocationNoteRecord from "./location-note-record";
import VideoNoteRecord from "./video-note-record";

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
			<NoteRecordComponent
				onDoubleClick={() => {
					if (import.meta.env.DEV) console.log(message);
				}}
				message={message}
				recordEntity={recordEntity}
				className={className}
				{...props}
			/>
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
				<Dialog>
					<DialogTrigger
						className={cn(
							"block w-full text-start py-3 px-3 text-muted-foreground bg-muted",
							className,
						)}
						{...rest}
					>
						暂未支持的笔记内容，点击查看原始数据
					</DialogTrigger>
					<DialogContent>
						<ScrollArea className="max-w-full overflow-hidden">
							<pre className="text-sm pb-4">
								{JSON.stringify(recordEntity, null, 2)}
							</pre>
							<ScrollBar orientation="horizontal" />
						</ScrollArea>
					</DialogContent>
				</Dialog>
			);
		}
	}
}
