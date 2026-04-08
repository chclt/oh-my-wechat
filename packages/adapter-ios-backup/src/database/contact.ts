import { fromBinary } from "@bufbuild/protobuf";
import { sql } from "drizzle-orm";
import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
	WCContactChatRoom,
	WCContactChatRoomSchema,
	WCContactHeadImage,
	WCContactHeadImageSchema,
	WCContactOpenIM,
	WCContactOpenIMSchema,
	WCContactProfile,
	WCContactProfileSchema,
	WCContactRemark,
	WCContactRemarkSchema,
	WCContactSocial,
	WCContactSocialSchema,
} from "./contact_pb";

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
	// dbContactBrand: blob({ mode: "buffer" }),
	// dbContactEncryptSecret: blob({ mode: "buffer" }),
	dbContactOpenIM: blob({ mode: "buffer" }),
	// dbContactOther blob({ mode: "buffer" }),
	// openIMAppid: text(),
});

export const friendTableSelect = {
	username: friendTable.username,
	type: friendTable.type,
	dbContactProfile: sql`${friendTable.dbContactProfile}`.mapWith(
		(value: typeof friendTable.$inferSelect.dbContactProfile) =>
			fromBinary(WCContactProfileSchema, value, { readUnknownFields: false }),
	),
	dbContactHeadImage: sql`${friendTable.dbContactHeadImage}`.mapWith(
		(value: typeof friendTable.$inferSelect.dbContactHeadImage) =>
			fromBinary(WCContactHeadImageSchema, value, { readUnknownFields: false }),
	),
	dbContactRemark: sql`${friendTable.dbContactRemark}`.mapWith(
		(value: typeof friendTable.$inferSelect.dbContactRemark) =>
			fromBinary(WCContactRemarkSchema, value, { readUnknownFields: false }),
	),
	dbContactSocial: sql`${friendTable.dbContactSocial}`.mapWith(
		(value: typeof friendTable.$inferSelect.dbContactSocial) =>
			fromBinary(WCContactSocialSchema, value, { readUnknownFields: false }),
	),
	dbContactChatRoom: sql`${friendTable.dbContactChatRoom}`.mapWith(
		(value: typeof friendTable.$inferSelect.dbContactChatRoom) =>
			value
				? fromBinary(WCContactChatRoomSchema, value, {
						readUnknownFields: false,
					})
				: null,
	),
	dbContactOpenIM: sql`${friendTable.dbContactOpenIM}`.mapWith(
		(value: typeof friendTable.$inferSelect.dbContactOpenIM) =>
			value
				? fromBinary(WCContactOpenIMSchema, value, { readUnknownFields: false })
				: null,
	),
};

export type friendTableSelectInfer = {
	username: string;
	type: number;
	dbContactProfile: WCContactProfile;
	dbContactHeadImage: WCContactHeadImage;
	dbContactRemark: WCContactRemark;
	dbContactSocial: WCContactSocial;
	dbContactChatRoom: WCContactChatRoom | null;
	dbContactOpenIM: WCContactOpenIM | null;
}[];

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
	// dbContactBrand: blob({ mode: "buffer" }),
	// dbContactEncryptSecret: blob({ mode: "buffer" }),
	dbContactOpenIM: blob({ mode: "buffer" }),
	// dbContactOther blob({ mode: "buffer" }),
	// openIMAppid: text(),
});

export const openIMContactTableSelect = {
	username: openIMContactTable.username,
	type: openIMContactTable.type,
	dbContactProfile: sql`${openIMContactTable.dbContactProfile}`.mapWith(
		(value: typeof openIMContactTable.$inferSelect.dbContactProfile) =>
			fromBinary(WCContactProfileSchema, value, { readUnknownFields: false }),
	),
	dbContactHeadImage: sql`${openIMContactTable.dbContactHeadImage}`.mapWith(
		(value: typeof openIMContactTable.$inferSelect.dbContactHeadImage) =>
			fromBinary(WCContactHeadImageSchema, value, { readUnknownFields: false }),
	),
	dbContactRemark: sql`${openIMContactTable.dbContactRemark}`.mapWith(
		(value: typeof openIMContactTable.$inferSelect.dbContactRemark) =>
			fromBinary(WCContactRemarkSchema, value, { readUnknownFields: false }),
	),
	dbContactSocial: sql`${openIMContactTable.dbContactSocial}`.mapWith(
		(value: typeof openIMContactTable.$inferSelect.dbContactSocial) =>
			fromBinary(WCContactSocialSchema, value, { readUnknownFields: false }),
	),
	dbContactChatRoom: sql`${openIMContactTable.dbContactChatRoom}`.mapWith(
		(value: typeof openIMContactTable.$inferSelect.dbContactChatRoom) =>
			value
				? fromBinary(WCContactChatRoomSchema, value, {
						readUnknownFields: false,
					})
				: null,
	),
	dbContactOpenIM: sql`${openIMContactTable.dbContactOpenIM}`.mapWith(
		(value: typeof openIMContactTable.$inferSelect.dbContactOpenIM) =>
			value
				? fromBinary(WCContactOpenIMSchema, value, { readUnknownFields: false })
				: null,
	),
};

export type openIMContactTableSelectInfer = {
	username: string;
	type: number;
	dbContactProfile: WCContactProfile;
	dbContactHeadImage: WCContactHeadImage;
	dbContactRemark: WCContactRemark;
	dbContactSocial: WCContactSocial;
	dbContactChatRoom: WCContactChatRoom | null;
	dbContactOpenIM: WCContactOpenIM | null;
}[];
