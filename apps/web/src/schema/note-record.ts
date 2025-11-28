import { RecordTypeEnum } from "@/schema/record.ts";

// TODO: 等有更多关于这个类型的信息再决定把这个类型放在哪里，以及叫什么
export interface NoteEntity {
	recordinfo: {
		desc: string;
		editTime: number;
		editusr: string;
		noteinfo: {
			noteauthor: string;
			noteeditor: string;
		};
		datalist: {
			"@_count": number;
			dataitem: NoteRecordType[];
		};
	};
}
/** 所有类型的笔记条目的公共字段 */
type NoteRecordBaseType<RecordType extends RecordTypeEnum> = {
	"@_datatype": RecordType;
	"@_dataid": string;
	"@_htmlid": string;
};

/** 含有文件信息的笔记条目的公共字段 */
type NoteRecordWithFileCommon = {
	fullmd5: string;
	cdndatakey: string;
	cdndataurl: string;
	head256md5: string;
	datasize: number;
};

/** 含有缩略图信息的笔记条目的公共字段 */
type NoteRecordEntityWithThumbCommon = {
	thumbfullmd5: string;
	cdnthumbkey: string;
	cdnthumburl: string;
	thumbhead256md5: string;
	thumbsize: number;
};

/** 笔记中的图片条目 */
export type ImageNoteRecordType = NoteRecordBaseType<RecordTypeEnum.IMAGE> &
	NoteRecordWithFileCommon &
	NoteRecordEntityWithThumbCommon;

/** 笔记中的音频条目 */
export type AudioNoteRecordType = NoteRecordBaseType<RecordTypeEnum.AUDIO> & {
	datafmt: "speex"; // 暂时只见过 speex 格式
	duration: number;
} & NoteRecordWithFileCommon;

/** 笔记中的视频条目 */
export type VideoNoteRecordType = NoteRecordBaseType<RecordTypeEnum.VIDEO> & {
	datafmt: string; // mp4
	duration: number; // 秒
} & NoteRecordWithFileCommon &
	Omit<NoteRecordEntityWithThumbCommon, "cdnthumburl">;

/** 笔记中的位置条目 */
export type LocationNoteRecordType =
	NoteRecordBaseType<RecordTypeEnum.LOCATION> & {
		locitem: {
			poiname: string;
			label: string;
			isfrompoilist: number;
			poiid: string;
			lng: number;
			lat: number;
			scale: number;
		};
	};

/** 笔记中的附件条目 */
export type AttachNoteRecordType = NoteRecordBaseType<RecordTypeEnum.ATTACH> & {
	datatitle: string;
	datafmt: string;
} & NoteRecordWithFileCommon;

/** 笔记中的实体条目的联合类型，比如图片、视频、附件 */
export type NoteRecordType =
	| ImageNoteRecordType
	| AudioNoteRecordType
	| VideoNoteRecordType
	| LocationNoteRecordType
	| AttachNoteRecordType;
