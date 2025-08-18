import { MessageDirection, MessageTypeEnum } from "@/schema";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Documents/${accountIdMd5}/DB/message_${number}.sqlite

export const chatTableColumns = {
	MesLocalID: integer(),
	MesSvrID: integer(),
	CreateTime: integer().notNull(),
	Des: integer().$type<MessageDirection>(),
	Message: text(),
	Type: integer().$type<MessageTypeEnum>(),
};

export const chatTable = sqliteTable("Chat", chatTableColumns);

export function getChatTable(tableName: string) {
	return sqliteTable(tableName, chatTableColumns);
}

export const helloTable = sqliteTable("Hello", chatTableColumns);

export function getHelloTable(tableName: string) {
	return sqliteTable(tableName, chatTableColumns);
}
