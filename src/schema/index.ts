export * from "./message";

import type { Database } from "sql.js";

export interface WCDatabases {
	manifest?: Database;
	session?: Database;
	message?: Database[];
	WCDB_Contact?: Database;
}

export type WCDatabaseNames = keyof WCDatabases;

export enum MessageDirection {
	outgoing = 0,
	incoming = 1,
}

export type DatabaseRow<T extends object> = T & {
	rowid: number;
};

export type DatabaseSessionAbstractRow = DatabaseRow<{
	CreateTime: number;
	UsrName: string;
	ConIntRes1: number; // 这一字段应该是代表有没有静音
}>;

export type DatabaseFriendRow = DatabaseRow<{
	userName: string;
	certificationFlag: number; // 0: 个人
	// dbContactBrand BLOB,
	dbContactChatRoom: Uint8Array;
	// dbContactEncryptSecret BLOB,
	dbContactHeadImage: Uint8Array;
	// dbContactLocal BLOB,
	dbContactOpenIM: Uint8Array;
	// dbContactOther BLOB,
	dbContactProfile: Uint8Array;
	dbContactRemark: Uint8Array;
	dbContactSocial: Uint8Array;
	encodeUserName: string;
	extFlag: number;
	imgStatus: number;
	openIMAppid: string;
	type: number;
	typeExt: number;
}>;

export type DatabaseMessageRow = DatabaseRow<{
	CreateTime: number;
	Des: MessageDirection;
	ImgStatus: 1 | 2; // unknown
	MesLocalID: string;
	Message: string;
	MesSvrID: string;
	Status: number;
	TableVer: number;
	Type: MessageTypeEnum;
}>;

export interface Contact {
	wxid: `wxid_${string}`;
	id: string;
	nickname: string;
	nicknamePinyin: string;
	remark: string;
	remarkPinyin: string;
	remarkPinyinInits: string;
}

export interface UserType {
	id: string; // wxid
	user_id: string;
	username: string;
	remark?: string;
	bio?: string;
	photo?: {
		origin?: string;
		thumb: string;
	};
	background?: string; // 朋友圈背景
	phone?: string;
	is_openim: boolean;
}

export interface AccountType extends UserType {}

export interface ChatroomType {
	id: `${string}@chatroom`;
	title: string;
	remark?: string;
	photo?: {
		origin?: string;
		thumb: string;
	};

	members: UserType[];
	is_openim: boolean;
}

interface BasicChatType {
	id: string;
	title: string;
	photo?: string;
	last_message?: MessageType;
	is_muted: boolean;
	is_pinned: boolean;
	is_collapsed: boolean;
	members: UserType[];
	background?: string;
}

export interface PrivateChatType extends BasicChatType {
	type: "private";
	user: UserType;
}

export interface GroupChatType extends BasicChatType {
	type: "chatroom";
	chatroom: ChatroomType;
}

export type ChatType = PrivateChatType | GroupChatType;

export interface PhotpSize {
	src: string;
	size: "origin" | "thumb";
	width?: number;
	height?: number;
	file_size?: number;
}

export interface VideoInfo {
	src?: string;
	poster: string;
	poster_width?: number;
	poster_height?: number;
	file_size?: number;
}

export interface VoiceInfo {
	src?: string;
	raw_aud_src: string;
	transcription?: string;
	file_size?: number;
}

export interface FileInfo {
	src: string;
}

export interface ControllerResult<T> {
	data: T;
}

export interface ControllerPaginatorCursor {
	value: number;
	condition: "<" | "<=" | ">" | ">=" | "<>";
	[key: string]: any;
}

export interface ControllerPaginatorResult<T> extends ControllerResult<T> {
	meta: {
		cursor?: string; // JSON.stringify(ControllerPaginatorCursor);
		previous_cursor?: string; // JSON.stringify(ControllerPaginatorCursor);
		next_cursor?: string; // JSON.stringify(ControllerPaginatorCursor);
	};
}
