import { getTableName } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Drizzle describes queries against this virtual table; the DDL below creates FTS5.
export const messageBodyFullTextIndexTable = sqliteTable(
	"messageBodyFullTextIndex",
	{
		rowid: integer("rowid").primaryKey(),
		tokenizedBody: text("tokenizedBody").notNull(),
	},
);

// Contentless FTS stores tokens only. Original text and source locations live here.
export const messageSearchMetadataTable = sqliteTable(
	"messageSearchMetadata",
	{
		rowid: integer("rowid").primaryKey(),
		shardIndex: integer("shardIndex").notNull(),
		sourceTableName: text("sourceTableName").notNull(),
		chatId: text("chatId").notNull(),
		messageLocalId: text("messageLocalId").notNull(),
		createTime: integer("createTime").notNull(),
		messagePlainText: text("messagePlainText").notNull(),
	},
	(table) => [index("messageSearchMetadataChatIdIndex").on(table.chatId)],
);

export type MessageSearchMetadata = Omit<
	typeof messageSearchMetadataTable.$inferSelect,
	"rowid"
>;

// Ephemeral in-memory schema, recreated for each build. Schema tests guard DDL drift.
export const MESSAGE_SEARCH_SCHEMA_SQL = `
CREATE VIRTUAL TABLE ${getTableName(messageBodyFullTextIndexTable)}
	USING fts5(tokenizedBody, content='');
CREATE TABLE ${getTableName(messageSearchMetadataTable)} (
	rowid INTEGER PRIMARY KEY,
	shardIndex INTEGER NOT NULL,
	sourceTableName TEXT NOT NULL,
	chatId TEXT NOT NULL,
	messageLocalId TEXT NOT NULL,
	createTime INTEGER NOT NULL,
	messagePlainText TEXT NOT NULL
);
CREATE INDEX messageSearchMetadataChatIdIndex
	ON ${getTableName(messageSearchMetadataTable)} (chatId);
`;
