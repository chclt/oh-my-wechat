import { MessageDirection, MessageTypeEnum, type UserType } from "@repo/types";
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import CryptoJS from "crypto-js";
import { afterAll, beforeAll, expect, test } from "vitest";
import { searchMessages } from "../../controllers/message-search.ts";
import type { WCDatabases } from "../../types.ts";
import {
	type DatabaseExecutor,
	drizzleFromExecutor,
	executorFromWasmDatabase,
} from "../executor.ts";
import { MessageSearchIndex } from "./message-search-index.ts";

const rows = [
	{ id: 1, chat: "first", time: 1700000000, text: "İ😀北京大学" },
	{
		id: 2,
		chat: "first",
		time: 1700000000,
		text: "北京旅游，京大合作，大学开学",
	},
	{ id: 3, chat: "first", time: 1700000000, text: "北京大学欢迎你" },
	{ id: 4, chat: "first", time: 1700000000, text: "needle" },
	{ id: 5, chat: "first", time: 1700000002, text: "needle" },
	{ id: 6, chat: "first", time: 1699999999, text: "needle" },
	{ id: 7, chat: "first", time: 1700000003, text: "needle" },
	{ id: 8, chat: "second", time: 1700000001, text: "needle" },
	{ id: 9, chat: "third", time: 1700000004, text: "needle" },
	{ id: 10, chat: "fourth", time: 1699999998, text: "needle needle" },
	{ id: 11, chat: "first", time: 1700000003, text: "needle" },
];
let index: MessageSearchIndex;
let executor: DatabaseExecutor;
let databases: WCDatabases;
const account: UserType = {
	id: "account",
	user_id: "account",
	username: "Account",
	is_openim: false,
};

beforeAll(async () => {
	const sqlite3 = await sqlite3InitModule();
	const source = new sqlite3.oo1.DB();
	executor = executorFromWasmDatabase(source);
	const database = drizzleFromExecutor(executor);
	databases = { session: database, WCDB_Contact: database };
	source.exec(`
		CREATE TABLE SessionAbstract (UsrName TEXT, ConIntRes1 INTEGER, CreateTime INTEGER);
		CREATE TABLE Friend (
			username TEXT, type INTEGER, dbContactProfile BLOB, dbContactHeadImage BLOB,
			dbContactRemark BLOB, dbContactSocial BLOB, dbContactChatRoom BLOB, dbContactOpenIM BLOB
		);
		CREATE TABLE OpenIMContact AS SELECT * FROM Friend;
	`);
	const chatIds = ["first", "second", "third", "fourth"];
	for (const chat of chatIds) {
		source.exec({
			sql: "INSERT INTO SessionAbstract VALUES (?, 0, 0)",
			bind: [chat],
		});
		const tableName = `Chat_${CryptoJS.MD5(chat).toString()}`;
		source.exec(
			`CREATE TABLE ${tableName} (MesLocalID INTEGER, CreateTime INTEGER, Type INTEGER, Message TEXT, Des INTEGER)`,
		);
		for (const row of rows.filter((row) => row.chat === chat)) {
			source.exec({
				sql: `INSERT INTO ${tableName} VALUES (?, ?, ?, ?, ?)`,
				bind: [
					row.id,
					row.time,
					MessageTypeEnum.TEXT,
					row.text,
					MessageDirection.incoming,
				],
			});
		}
	}
	index = new MessageSearchIndex(sqlite3);
	await index.build([database], chatIds, account.id);
});

afterAll(() => {
	index.dispose();
	executor.close();
});

test("matches a continuous phrase, not scattered fragments, with original-text highlight offsets", async () => {
	const result = await searchMessages(
		{
			account: { id: "account" },
			chat: { id: "first" },
			searchText: "北京大学",
			offset: 0,
			limit: 20,
		},
		{ messageSearchIndex: index, account, databases },
	);
	expect(result.meta.total).toBe(2);
	expect(result.data).toHaveLength(2);
	expect(
		new Map(result.data.map((hit) => [hit.messageLocalId, hit.match])),
	).toEqual(
		new Map([
			["1", { start: 3, end: 7 }],
			["3", { start: 0, end: 4 }],
		]),
	);
});

test("search pagination includes both ISO time boundaries and excludes other chats", async () => {
	const request = {
		account: { id: "account" },
		chat: { id: "first" },
		searchText: "needle",
		startTime: "2023-11-14T22:13:20.000Z",
		endTime: "2023-11-14T22:13:22.000Z",
		limit: 1,
	};
	const context = { messageSearchIndex: index, account, databases };
	const first = await searchMessages({ ...request, offset: 0 }, context);
	const second = await searchMessages({ ...request, offset: 1 }, context);
	const beyond = await searchMessages({ ...request, offset: 2 }, context);

	expect(first.meta).toEqual({ total: 2, offset: 0, limit: 1 });
	expect(second.meta).toEqual({ total: 2, offset: 1, limit: 1 });
	expect(first.data).toHaveLength(1);
	expect(second.data).toHaveLength(1);
	expect(
		new Set([...first.data, ...second.data].map((hit) => hit.messageLocalId)),
	).toEqual(new Set(["4", "5"]));
	expect(beyond).toEqual({ data: [], meta: { total: 2, offset: 2, limit: 1 } });
});

test("global search pages distinct chats by their best match and counts messages within the filters", async () => {
	const request = {
		account: { id: "account" },
		searchText: "needle",
		limit: 2,
	};
	const context = { messageSearchIndex: index, account, databases };
	const first = await searchMessages({ ...request, offset: 0 }, context);
	const second = await searchMessages({ ...request, offset: 2 }, context);
	const beyond = await searchMessages({ ...request, offset: 4 }, context);

	expect(first.meta).toEqual({ total: 4, offset: 0, limit: 2 });
	expect(second.meta).toEqual({ total: 4, offset: 2, limit: 2 });
	expect(
		[...first.data, ...second.data].map((hit) => ({
			chatId: hit.chat.id,
			messageLocalId: hit.messageLocalId,
			matchCount: hit.matchCount,
		})),
	).toEqual([
		{ chatId: "fourth", messageLocalId: "10", matchCount: 1 },
		{ chatId: "third", messageLocalId: "9", matchCount: 1 },
		{ chatId: "first", messageLocalId: "7", matchCount: 5 },
		{ chatId: "second", messageLocalId: "8", matchCount: 1 },
	]);
	expect(beyond).toEqual({ data: [], meta: { total: 4, offset: 4, limit: 2 } });

	const filtered = await searchMessages(
		{
			...request,
			offset: 0,
			startTime: "2023-11-14T22:13:20.000Z",
			endTime: "2023-11-14T22:13:22.000Z",
		},
		context,
	);
	expect(filtered.meta.total).toBe(2);
	expect(
		filtered.data.map((hit) => [
			hit.chat.id,
			hit.messageLocalId,
			hit.matchCount,
		]),
	).toEqual([
		["first", "5", 2],
		["second", "8", 1],
	]);
	const scoped = await searchMessages(
		{ ...request, chat: { id: "first" }, offset: 0, limit: 20 },
		context,
	);
	expect(scoped.meta.total).toBe(second.data[0].matchCount);
	expect(scoped.data.every((hit) => hit.matchCount === undefined)).toBe(true);
});
