import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";

type SQLiteDatabase = SqliteRemoteDatabase<Record<string, never>>;

export interface WCDatabases {
	manifest?: SQLiteDatabase;
	session?: SQLiteDatabase;
	message?: SQLiteDatabase[];
	WCDB_Contact?: SQLiteDatabase;
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
