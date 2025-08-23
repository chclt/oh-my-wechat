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

export const chatTableSelect = {
	MesLocalID: sql<string>`CAST(${chatTable.MesLocalID} as TEXT)`.as(
		"MesLocalID",
	),
	MesSvrID: sql<string>`CAST(${chatTable.MesSvrID} as TEXT)`.as("MesSvrID"),
	CreateTime: chatTable.CreateTime,
	Des: chatTable.Des,
	Message: chatTable.Message,
	Type: chatTable.Type,
};

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

export const helloTable = sqliteTable("Hello", chatTableColumns);

export function getHelloTable(tableName: string) {
	return sqliteTable(tableName, chatTableColumns);
}
