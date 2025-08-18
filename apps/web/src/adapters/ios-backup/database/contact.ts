import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Documents/${accountIdMd5}/DB/WCDB_Contact.sqlite

export const friendTable = sqliteTable("Friend", {
	username: text().notNull(),
	// encodeUserName: text(),
	type: integer().notNull(),
	// typeExt: integer(),
	// imgStatus: integer(),
	// extFlag: integer(),

	dbContactProfile: blob({ mode: "buffer" }).notNull(),
	dbContactHeadImage: blob({ mode: "buffer" }).notNull(),
	dbContactRemark: blob({ mode: "buffer" }).notNull(),
	dbContactSocial: blob({ mode: "buffer" }).notNull(),

	// certificationFlag: integer(), // 0: 个人
	dbContactChatRoom: blob({ mode: "buffer" }),
	dbContactBrand: blob({ mode: "buffer" }),
	// dbContactEncryptSecret: blob({ mode: "buffer" }),
	dbContactOpenIM: blob({ mode: "buffer" }),
	// dbContactOther blob(),
	// openIMAppid: text(),
});

export const openIMContactTable = sqliteTable("OpenIMContact", {
	username: text().notNull(),
	// encodeUserName: text(),
	type: integer().notNull(),
	// typeExt: integer(),
	// imgStatus: integer(),
	// extFlag: integer(),

	dbContactProfile: blob({ mode: "buffer" }).notNull(),
	dbContactHeadImage: blob({ mode: "buffer" }).notNull(),
	dbContactRemark: blob({ mode: "buffer" }).notNull(),
	dbContactSocial: blob({ mode: "buffer" }).notNull(),

	// certificationFlag: integer(),
	dbContactChatRoom: blob({ mode: "buffer" }),
	dbContactBrand: blob({ mode: "buffer" }),
	// dbContactEncryptSecret: blob({ mode: "buffer" }),
	dbContactOpenIM: blob({ mode: "buffer" }),
	// dbContactOther blob(),
	// openIMAppid: text(),
});
