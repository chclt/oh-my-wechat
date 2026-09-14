import { MessageTypeEnum } from "@repo/types";
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import CryptoJS from "crypto-js";
import { afterAll, beforeAll, expect, test } from "vitest";
import { searchMessages } from "../../controllers/message-search.ts";
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
];
let index: MessageSearchIndex;
let executor: DatabaseExecutor;

beforeAll(async () => {
	const sqlite3 = await sqlite3InitModule();
	const source = new sqlite3.oo1.DB();
	executor = executorFromWasmDatabase(source);
	for (const chat of ["first", "second"]) {
		const tableName = `Chat_${CryptoJS.MD5(chat).toString()}`;
		source.exec(
			`CREATE TABLE ${tableName} (MesLocalID INTEGER, CreateTime INTEGER, Type INTEGER, Message TEXT)`,
		);
		for (const row of rows.filter((row) => row.chat === chat)) {
			source.exec({
				sql: `INSERT INTO ${tableName} VALUES (?, ?, ?, ?)`,
				bind: [row.id, row.time, MessageTypeEnum.TEXT, row.text],
			});
		}
	}
	index = new MessageSearchIndex(sqlite3);
	await index.build([drizzleFromExecutor(executor)], ["first", "second"]);
});

afterAll(() => {
	index.dispose();
	executor.close();
});

test("matches a continuous phrase, not scattered fragments, with original-text highlight offsets", async () => {
	const result = await searchMessages(
		{
			account: { id: "account" },
			searchText: "北京大学",
			offset: 0,
			limit: 20,
		},
		{ messageSearchIndex: index },
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
	const context = { messageSearchIndex: index };
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
