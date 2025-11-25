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

export interface NoteImageRecordEntity {
	"@_datatype": RecordTypeEnum.IMAGE;
	"@_dataid": string;
	"@_htmlid": string;

	thumbfullmd5: string;
	cdnthumbkey: string;
	cdnthumburl: string;
	thumbhead256md5: string;
	thumbsize: number;

	fullmd5: string;
	cdndatakey: string;
	cdndataurl: string;
	head256md5: string;
	datasize: number;
}

export interface NoteAudioRecordEntity {
	"@_datatype": RecordTypeEnum.AUDIO;
	"@_dataid": string;
	"@_htmlid": string;

	cdndataurl: string;
	cdndatakey: string;
	fullmd5: string;
	datafmt: "speex"; // 暂时只见过 speex 格式
	datasize: number;
	duration: number;
	head256md5: string;
}

export interface NoteVideoRecordEntity {
	"@_datatype": RecordTypeEnum.VIDEO;
	"@_dataid": string;
	"@_htmlid": string;

	datafmt: string; // mp4
	duration: number; // 秒

	datasize: number;
	cdndataurl: string;
	cdnthumbkey: string;
	fullmd5: string;
	head256md5: string;

	thumbsize: number;
	thumbfullmd5: string;
	thumbhead256md5: string;
	cdndatakey: string;
}

export interface NoteLocationRecordEntity {
	"@_datatype": RecordTypeEnum.LOCATION;
	"@_dataid": string;
	"@_htmlid": string;

	locitem: {
		poiname: string;
		label: string;
		isfrompoilist: number;
		poiid: string;
		lng: number;
		lat: number;
		scale: number;
	};
}

export interface NoteAttachRecordEntity {
	"@_datatype": RecordTypeEnum.ATTACH;
	"@_dataid": string;
	"@_htmlid": string;

	datatitle: string;
	datasize: number;
	datafmt: string;
	cdndataurl: string;
	cdndatakey: string;
	fullmd5: string;
	head256md5: string;
}

export type NoteRecordEntity =
	| NoteImageRecordEntity
	| NoteAudioRecordEntity
	| NoteVideoRecordEntity
	| NoteLocationRecordEntity
	| NoteAttachRecordEntity;
