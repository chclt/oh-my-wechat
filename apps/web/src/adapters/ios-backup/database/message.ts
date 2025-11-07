import { MessageDirection, MessageTypeEnum } from "@/schema";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Documents/${accountIdMd5}/DB/message_${number}.sqlite

export const chatTableColumns = {
	MesLocalID: integer().notNull(),
	MesSvrID: integer().notNull(),
	CreateTime: integer().notNull(),
	Des: integer().notNull().$type<MessageDirection>(),
	Message: text().notNull(), // 可能是blob
	Type: integer().notNull().$type<MessageTypeEnum>(),
};

export const chatTable = sqliteTable("Chat", chatTableColumns);

// table shoule be returned by getChatTable
export const chatTableSelect = (table: {
	MesLocalID: any;
	MesSvrID: any;
	CreateTime: any;
	Des: any;
	Message: any;
	Type: any;
}) => ({
	MesLocalID: sql<string>`CAST(${table.MesLocalID} as TEXT)`.as("MesLocalID"),
	MesSvrID: sql<string>`CAST(${table.MesSvrID} as TEXT)`.as("MesSvrID"),
	CreateTime: table.CreateTime,
	Des: table.Des,
	Message: table.Message,
	Type: table.Type,
});

export type ChatTableSelectInfer = Omit<
	typeof chatTable.$inferSelect,
	"MesSvrID" | "MesLocalID"
> & {
	MesSvrID: string;
	MesLocalID: string;
};

export function getChatTable(tableName: string) {
	return sqliteTable(tableName, chatTableColumns);
}

export const helloTableColumns = Object.assign(chatTableColumns, {
	ConIntRes1: integer().notNull(),
	UsrName: text().notNull(),
	OpCode: integer().notNull(),
});

export const helloTable = sqliteTable("Hello", helloTableColumns);

export const helloTableSelect = (table: {
	MesLocalID: any;
	MesSvrID: any;
	CreateTime: any;
	Des: any;
	Message: any;
	Type: any;

	ConIntRes1: any;
	UsrName: any;
	OpCode: any;
}) => ({
	MesLocalID: sql<string>`CAST(${table.MesLocalID} as TEXT)`.as("MesLocalID"),
	MesSvrID: sql<string>`CAST(${table.MesSvrID} as TEXT)`.as("MesSvrID"),
	CreateTime: table.CreateTime,
	Des: table.Des,
	Message: table.Message,
	Type: table.Type,

	ConIntRes1: table.ConIntRes1,
	UsrName: table.UsrName,
	OpCode: table.OpCode,
});

export type HelloTableSelectInfer = Omit<
	typeof helloTable.$inferSelect,
	"MesSvrID" | "MesLocalID"
> & {
	MesSvrID: string;
	MesLocalID: string;
};

export function getHelloTable(tableName: string) {
	return sqliteTable(tableName, helloTableColumns);
}
