import { MessageDirection, MessageTypeEnum } from "@/schema";
import { Database } from "sql.js";

export interface WCDatabases {
	manifest?: Database;
	session?: Database;
	message?: Database[];
	WCDB_Contact?: Database;
}

export type WCDatabaseNames = keyof WCDatabases;

export type DatabaseRow<T extends object> = T & {
	rowid: number;
};

export type DatabaseSessionAbstractRow = DatabaseRow<{
	CreateTime: number;
	UsrName: string;
	ConIntRes1: number; // 这一字段应该是代表有没有静音
}>;

export type DatabaseFriendRow = DatabaseRow<{
	username: string;
	// certificationFlag: number; // 0: 个人
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
	// encodeUserName: string;
	// extFlag: number;
	// imgStatus: number;
	// openIMAppid: string;
	type: number;
	// typeExt: number;
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

export interface ControllerPaginatorCursor {
	value: number;
	condition: "<" | "<=" | ">" | ">=" | "<>";
	[key: string]: any;
}
