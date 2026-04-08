import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const filesTable = sqliteTable("Files", {
	fileID: text().primaryKey(),
	domain: text(),
	relativePath: text(),
	flags: int(),
	// file: blob(), // unused
});
