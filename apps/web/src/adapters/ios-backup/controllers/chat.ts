import type {
	ChatType,
	ChatroomType,
	GroupChatType,
	PrivateChatType,
	UserType,
} from "@/schema";
import CryptoJS from "crypto-js";
import * as UserController from "./user.ts";
import { adapterWorker } from "../worker";
import type { DataAdapterResponse } from "@/adapters/adapter";
import type { WCDatabases } from "../types";
import { sessionAbstractTable } from "../database/session";
import { desc, inArray } from "drizzle-orm";

async function parseSessionDatabaseSessionAbstractTableRows(
	databases: WCDatabases,
	rows: (typeof sessionAbstractTable.$inferSelect)[],
): Promise<ChatType[]> {
	const contactRows: (UserType | ChatroomType)[] = (
		await UserController.findAll(
			{
				ids: rows.map((row) => row.UsrName),
			},
			{ databases },
		)
	).data;

	const contacts: { [key: string]: UserType | ChatroomType } = {};
	for (const contact of contactRows) {
		contacts[contact.id] = contact;
	}

	const result: ChatType[] = [];

	for (const row of rows) {
		const contactInfo = contacts[row.UsrName];
		const chat = row.UsrName.endsWith("@chatroom")
			? ({
					type: "chatroom",

					id: row.UsrName,
					title: contactInfo
						? (contactInfo.remark ?? (contactInfo as ChatroomType).title)
						: "-",
					is_muted: !!row.ConIntRes1,
					// @ts-ignore
					is_pinned: (contactInfo as ChatroomType)._is_pinned,
					// @ts-ignore
					is_collapsed: (contactInfo as ChatroomType)._is_collapsed,
					...(contactInfo?.photo ? { photo: contactInfo.photo.thumb } : {}),
					members: (contactInfo as ChatroomType).members,

					chatroom: contactInfo as ChatroomType,

					...(import.meta.env.DEV
						? {
								__dev: {
									id_md5: CryptoJS.MD5(row.UsrName).toString(),
									database_row: row,
									contact: contactInfo,
								},
							}
						: {}),
				} as GroupChatType)
			: ({
					type: "private",

					id: row.UsrName,
					title: contactInfo
						? (contactInfo.remark ?? (contactInfo as UserType).username)
						: row.UsrName,
					...(contactInfo?.photo ? { photo: contactInfo.photo.thumb } : {}),
					is_muted: !!row.ConIntRes1,
					is_pinned: contactInfo
						? // @ts-ignore
							(contactInfo as UserType)._is_pinned
						: false, // todo
					is_collapsed: false,
					members: [adapterWorker._getStoreItem("account"), contactInfo],

					user: contactInfo,

					...(import.meta.env.DEV
						? {
								__dev: {
									id_md5: CryptoJS.MD5(row.UsrName).toString(),
									database_row: row,
									user: contactInfo,
								},
							}
						: {}),
				} as PrivateChatType);

		result.push(chat);
	}

	return result;
}

export type AllInput = [{ databases: WCDatabases }];
export type AllOutput = Promise<DataAdapterResponse<ChatType[]>>;

export async function all(...inputs: AllInput): AllOutput {
	const [{ databases }] = inputs;

	const db = databases.session;
	if (!db) {
		throw new Error("session database is not found");
	}

	const rows = db
		.select()
		.from(sessionAbstractTable)
		.orderBy(desc(sessionAbstractTable.CreateTime))
		.all();

	return {
		data: await parseSessionDatabaseSessionAbstractTableRows(databases, rows),
	};
}

export type FindInput = [{ ids: string[] }, { databases: WCDatabases }];
export type FindOutput = Promise<DataAdapterResponse<ChatType[]>>;

export async function find(...inputs: FindInput): FindOutput {
	const [{ ids }, { databases }] = inputs;

	const db = databases.session;
	if (!db) {
		throw new Error("session database is not found");
	}

	if (ids.length === 0) return { data: [] };

	const rows = db
		.select()
		.from(sessionAbstractTable)
		.where(inArray(sessionAbstractTable.UsrName, ids))
		.orderBy(desc(sessionAbstractTable.CreateTime))
		.all();

	return {
		data: await parseSessionDatabaseSessionAbstractTableRows(databases, rows),
	};
}
