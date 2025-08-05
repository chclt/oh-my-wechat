import type {
	ChatType,
	ChatroomType,
	ControllerResult,
	DatabaseSessionAbstractRow,
	GroupChatType,
	PrivateChatType,
	UserType,
	WCDatabases,
} from "@/lib/schema.ts";
import CryptoJS from "crypto-js";
import { ContactController } from "./contact";

import specialBrandId from "@/assets/specialBrandUserNames.csv?raw";
import { _store } from "../worker";

export namespace ChatController {
	async function parseDatabaseChatRows(
		databases: WCDatabases,
		dbSessionAbstractRows: DatabaseSessionAbstractRow[],
	): Promise<ChatType[]> {
		const specialBrandIds = specialBrandId.split("\n").map((i) => i.trim());

		const dbSessionAbstractRowsFiltered = dbSessionAbstractRows.filter(
			(row) =>
				!(
					row.UsrName.startsWith("gh_") ||
					row.UsrName.endsWith("@openim") || // TODO
					specialBrandIds.includes(row.UsrName) ||
					[
						"chatroom_session_box",
						"newsapp",
						"brandsessionholder",
						"notification_messages",
						"brandsessionholder_weapp",
						"opencustomerservicemsg",
					].includes(row.UsrName)
				),
		);

		const contactRows: (UserType | ChatroomType)[] = (
			await ContactController.findAll(
				{
					ids: dbSessionAbstractRowsFiltered.map((row) => row.UsrName),
				},
				{ databases },
			)
		).data;
		const contacts: { [key: string]: UserType | ChatroomType } = {};
		for (const contact of contactRows) {
			contacts[contact.id] = contact;
		}

		const result: ChatType[] = [];

		for (const row of dbSessionAbstractRowsFiltered) {
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
						raw: {
							id_md5: CryptoJS.MD5(row.UsrName).toString(),

							row,
							contactInfo,
						},
					} as GroupChatType)
				: ({
						type: "private",

						id: row.UsrName,
						title: contactInfo
							? (contactInfo.remark ?? (contactInfo as UserType).username)
							: row.UsrName,
						...(contactInfo?.photo ? { photo: contactInfo.photo.thumb } : {}),
						is_muted: !!row.ConIntRes1,
						// @ts-ignore
						is_pinned: contactInfo
							? (contactInfo as UserType)._is_pinned
							: false, // todo
						is_collapsed: false,
						members: [_store.account, contactInfo],

						user: contactInfo,

						raw: {
							id_md5: CryptoJS.MD5(row.UsrName).toString(),
							row,
							contactInfo,
						},
					} as PrivateChatType);

			result.push(chat);
		}

		return result;
	}

	export type AllInput = [{ databases: WCDatabases }];
	export type AllOutput = Promise<ControllerResult<ChatType[]>>;

	export async function all(...inputs: AllInput): AllOutput {
		const [{ databases }] = inputs;

		const db = databases.session;
		if (!db) {
			throw new Error("session database is not found");
		}

		const dbSessionAbstractRows: DatabaseSessionAbstractRow[] = db
			.exec(
				"SELECT rowid, CreateTime, UsrName, ConIntRes1 FROM SessionAbstract ORDER BY CreateTime Desc",
			)[0]
			.values.reduce((acc, cur) => {
				acc.push({
					rowid: cur[0],
					CreateTime: cur[1],
					UsrName: cur[2],
					ConIntRes1: cur[3],
				} as DatabaseSessionAbstractRow);
				return acc;
			}, [] as DatabaseSessionAbstractRow[]);

		return {
			data: await parseDatabaseChatRows(databases, dbSessionAbstractRows),
		};
	}

	export type FindInput = [{ ids: string[] }, { databases: WCDatabases }];
	export type FindOutput = Promise<ControllerResult<ChatType[]>>;

	export async function find(...inputs: FindInput): FindOutput {
		const [{ ids }, { databases }] = inputs;

		const db = databases.session;
		if (!db) {
			throw new Error("session database is not found");
		}

		if (ids.length === 0) return { data: [] };

		const dbSessionAbstractRows: DatabaseSessionAbstractRow[] = db
			.exec(
				`SELECT rowid, CreateTime, UsrName, ConIntRes1 FROM SessionAbstract WHERE UsrName IN (${ids.map((id) => `'${id}'`).join(",")}) ORDER BY CreateTime Desc`,
			)[0]
			.values.reduce((acc, cur) => {
				acc.push({
					rowid: cur[0],
					CreateTime: cur[1],
					UsrName: cur[2],
					ConIntRes1: cur[3],
				} as DatabaseSessionAbstractRow);
				return acc;
			}, [] as DatabaseSessionAbstractRow[]);

		return {
			data: await parseDatabaseChatRows(databases, dbSessionAbstractRows),
		};
	}
}
