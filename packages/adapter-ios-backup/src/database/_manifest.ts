import { customType, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

const bytes = customType<{ data: Uint8Array; driverData: Uint8Array }>({
	dataType: () => "blob",
});

export const filesTable = sqliteTable("Files", {
	fileID: text().primaryKey(),
	domain: text(),
	relativePath: text(),
	flags: int(),
	file: bytes(),
});
