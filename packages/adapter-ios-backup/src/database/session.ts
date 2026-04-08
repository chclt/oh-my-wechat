import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Documents/${accountIdMd5}/session/session.db

export const sessionAbstractTable = sqliteTable("SessionAbstract", {
	UsrName: text().notNull(),
	ConIntRes1: integer({ mode: "boolean" }), // 这一字段应该是代表有没有静音
	CreateTime: integer({ mode: "timestamp" }),
});
