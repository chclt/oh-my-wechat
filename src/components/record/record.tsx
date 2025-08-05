import LiveRecord, {
	type LiveRecordEntity,
} from "@/components/record/live-record.tsx";
import { type MessageVM, RecordType } from "@/lib/schema";
import { decodeUnicodeReferences } from "@/lib/utils";
import { ErrorBoundary } from "react-error-boundary";
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
	message: MessageVM;
	record: RecordVM;
	variant?: "default" | "note" | string; // 笔记消息中的记录需要不同样式
}

export interface RecordVM {
	"@_datatype": RecordType;
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
				onDoubleClick={() => {
					if (import.meta.env.DEV) {
						console.log(record);
					}
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
		case RecordType.TEXT:
			return (
				<TextRecord
					message={message}
					record={record as unknown as TextRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordType.IMAGE:
			return (
				<ImageRecord
					message={message}
					record={record as unknown as ImageRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordType.LINK:
			return (
				<LinkRecord
					message={message}
					record={record as unknown as LinkRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordType.LOCATION:
			return (
				<LocationRecord
					message={message}
					record={record as unknown as LocationRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordType.ATTACH:
			return (
				<AttatchRecord
					message={message}
					record={record as unknown as AttatchRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordType.CONTACT:
			return (
				<ContactRecord
					message={message}
					record={record as unknown as ContactRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordType.FORWARD_MESSAGE:
			return (
				<ForwardMessageRecord
					message={message}
					record={record as unknown as ForwardMessageRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordType.MINIAPP:
			return (
				<MiniAppRecord
					message={message}
					record={record as unknown as MiniAppRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordType.NOTE:
			return (
				<NoteRecord
					message={message}
					record={record as unknown as NoteRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordType.CHANNEL_VIDEO:
			return (
				<ChannelVideoRecord
					message={message}
					record={record as unknown as ChannelVideoRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordType.LIVE:
			return (
				<LiveRecord
					message={message}
					record={record as unknown as LiveRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordType.CHANNEL:
			return (
				<ChannelRecord
					message={message}
					record={record as unknown as ChannelRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordType.MUSIC:
			return (
				<MusicRecord
					message={message}
					record={record as unknown as MusicRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		case RecordType.TING:
			return (
				<TingRecord
					message={message}
					record={record as unknown as TingRecordEntity}
					variant={variant}
					{...props}
				/>
			);
		default:
			return (
				<div>
					{record["@_datatype"]}:{/* @ts-ignore */}
					{record.datadesc
						? // @ts-ignore
							decodeUnicodeReferences(record.datadesc)
						: // @ts-ignore
							record.datatitle}
				</div>
			);
	}
}
