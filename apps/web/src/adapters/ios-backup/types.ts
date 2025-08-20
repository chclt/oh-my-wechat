import { MessageDirection, MessageTypeEnum } from "@/schema";
import { SQLJsDatabase } from "drizzle-orm/sql-js";

export interface WCDatabases {
	manifest?: SQLJsDatabase;
	session?: SQLJsDatabase;
	message?: SQLJsDatabase[];
	WCDB_Contact?: SQLJsDatabase;
}

export type WCDatabaseNames = keyof WCDatabases;

export type DatabaseRow<T extends object> = T & {
	rowid: number;
};

export interface ControllerPaginatorCursor {
	value: number;
	condition: "<" | "<=" | ">" | ">=" | "<>";
	[key: string]: any;
}
