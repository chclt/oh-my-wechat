import { MessageDirection, MessageTypeEnum } from "@/schema";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Documents/${accountIdMd5}/DB/message_${number}.sqlite

export const chatTableColumns = {
	MesLocalID: integer().notNull(),
	MesSvrID: integer().notNull(),
	CreateTime: integer().notNull(),
	Des: integer().notNull().$type<MessageDirection>(),
	Message: text().notNull(),
	Type: integer().notNull().$type<MessageTypeEnum>(),
};

export const chatTable = sqliteTable("Chat", chatTableColumns);

const chatTableSelectSegment = {
	[chatTable.MesLocalID.name]: chatTable.MesLocalID,
	[chatTable.MesSvrID.name]:
		sql<string>`CAST(${chatTable.MesSvrID} as TEXT)`.as(
			chatTable.MesSvrID.name,
		),
	[chatTable.CreateTime.name]: chatTable.CreateTime,
	[chatTable.Des.name]: chatTable.Des,
	[chatTable.Message.name]: chatTable.Message,
	[chatTable.Type.name]: chatTable.Type,
};

export type ChatTableRowInfer = Omit<
	typeof chatTable.$inferSelect,
	"MesSvrID" | "MesLocalID"
> & {
	MesSvrID: string;
	MesLocalID: string; // TODO: not implemented in query
};

export function getChatTable(tableName: string) {
	return sqliteTable(tableName, chatTableColumns);
}

export const helloTable = sqliteTable("Hello", chatTableColumns);

export function getHelloTable(tableName: string) {
	return sqliteTable(tableName, chatTableColumns);
}
