import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Documents/${accountIdMd5}/DB/WCDB_Contact.sqlite

export const friendTable = sqliteTable("Friend", {
	username: text().notNull(),
	// encodeUserName: text(),
	type: integer().notNull(),
	// typeExt: integer(),
	// imgStatus: integer(),
	// extFlag: integer(),

	dbContactProfile: blob(),
	dbContactHeadImage: blob(),
	dbContactRemark: blob(),
	dbContactSocial: blob(),

	// certificationFlag: integer(), // 0: 个人
	dbContactBrand: blob(),
	// dbContactEncryptSecret: blob(),
	dbContactOpenIM: blob(),
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

	dbContactProfile: blob(),
	dbContactHeadImage: blob(),
	dbContactRemark: blob(),
	dbContactSocial: blob(),

	// certificationFlag: integer(),
	dbContactBrand: blob(),
	// dbContactEncryptSecret: blob(),
	dbContactOpenIM: blob(),
	// dbContactOther blob(),
	// openIMAppid: text(),
});
