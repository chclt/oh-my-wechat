import { RecordTypeEnum } from "@/schema/record.ts";

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
			dataitem: NoteRecordEntity[];
		};
	};
}

type NoteRecordEntityBase<RecordType extends RecordTypeEnum> = {
	"@_datatype": RecordType;
	"@_dataid": string;
	"@_htmlid": string;
};

/** 带有文件的记录的公共字段 */
type NoteRecordEntityWithFileCommon = {
	fullmd5: string;
	cdndatakey: string;
	cdndataurl: string;
	head256md5: string;
	datasize: number;
};

/** 带有缩略图的记录的公共字段 */
type NoteRecordEntityWithThumbCommon = {
	thumbfullmd5: string;
	cdnthumbkey: string;
	cdnthumburl: string;
	thumbhead256md5: string;
	thumbsize: number;
};

/** 图片 */
export type NoteImageRecordEntity = NoteRecordEntityBase<RecordTypeEnum.IMAGE> &
	NoteRecordEntityWithFileCommon &
	NoteRecordEntityWithThumbCommon;

/** 音频 */
export type NoteAudioRecordEntity =
	NoteRecordEntityBase<RecordTypeEnum.AUDIO> & {
		datafmt: "speex"; // 暂时只见过 speex 格式
		duration: number;
	} & NoteRecordEntityWithFileCommon;

/** 视频 */
export type NoteVideoRecordEntity =
	NoteRecordEntityBase<RecordTypeEnum.VIDEO> & {
		datafmt: string; // mp4
		duration: number; // 秒
	} & NoteRecordEntityWithFileCommon &
		Omit<NoteRecordEntityWithThumbCommon, "cdnthumburl">;

/** 位置 */
export type NoteLocationRecordEntity =
	NoteRecordEntityBase<RecordTypeEnum.LOCATION> & {
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

/** 附件 */
export type NoteAttachRecordEntity =
	NoteRecordEntityBase<RecordTypeEnum.ATTACH> & {
		datatitle: string;
		datafmt: string;
	} & NoteRecordEntityWithFileCommon;

export type NoteRecordEntity =
	| NoteImageRecordEntity
	| NoteAudioRecordEntity
	| NoteVideoRecordEntity
	| NoteLocationRecordEntity
	| NoteAttachRecordEntity;
