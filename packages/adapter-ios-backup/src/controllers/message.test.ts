import { MessageDirection, MessageTypeEnum } from "@repo/types";
import type { GetMessageListRequest } from "@repo/types/adapter";
import sqlite3InitModule, { type Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import CryptoJS from "crypto-js";
import { afterEach, beforeAll, expect, test, vi } from "vitest";
import {
	type DatabaseExecutor,
	drizzleFromExecutor,
	executorFromWasmDatabase,
} from "../database/executor.ts";
import { all } from "./message.ts";

// Contact hydration is unrelated to pagination; the message queries use real SQLite.
vi.mock("./chat.ts", () => ({
	find: async () => ({
		data: [
			{ id: "chat", type: "private", title: "Chat", user: { id: "chat" } },
		],
	}),
}));
vi.mock("./user.ts", () => ({
	findAll: async () => ({ data: [] }),
}));

let sqlite3: Sqlite3Static;
const executors: DatabaseExecutor[] = [];
const base: GetMessageListRequest = {
	account: { id: "account" },
	chat: { id: "chat" },
	limit: 3,
};
beforeAll(async () => {
	sqlite3 = await sqlite3InitModule();
});
afterEach(() => {
	executors.splice(0).forEach((executor) => executor.close());
});

function database(rows: { localId: number | bigint; time: number }[]) {
	const source = new sqlite3.oo1.DB();
	const executor = executorFromWasmDatabase(source);
	executors.push(executor);
	const tableName = `Chat_${CryptoJS.MD5("chat").toString()}`;
	source.exec(
		`CREATE TABLE ${tableName} (MesLocalID INTEGER PRIMARY KEY, MesSvrID INTEGER, CreateTime INTEGER, Des INTEGER, Type INTEGER, Message TEXT)`,
	);
	for (const row of rows) {
		source.exec({
			sql: `INSERT INTO ${tableName} VALUES (?, ?, ?, ?, ?, ?)`,
			bind: [
				row.localId,
				0,
				row.time,
				MessageDirection.incoming,
				MessageTypeEnum.TEXT,
				String(row.localId),
			],
		});
	}
	return drizzleFromExecutor(executor);
}

function readPage(
	request: GetMessageListRequest,
	source: ReturnType<typeof database>,
) {
	return all(request, {
		account: {
			id: "account",
			user_id: "account",
			username: "Account",
			is_openim: false,
		},
		databases: { message: [source] },
	});
}

const ids = (page: Awaited<ReturnType<typeof readPage>>) =>
	page.data.map((message) => message.local_id);

test("same-second messages remain complete and ordered when paging backwards and forwards", async () => {
	const source = database([
		{ localId: 1, time: 1002 },
		{ localId: 2, time: 1000 },
		{ localId: 3, time: 1000 },
		{ localId: 4, time: 1002 },
		{ localId: 5, time: 1001 },
		{ localId: 6, time: 1000 },
		{ localId: 10, time: 1000 },
		{ localId: 11, time: 1002 },
		{ localId: 12, time: 1001 },
	]);
	const latest = await readPage(base, source);
	expect(ids(latest)).toEqual(["1", "4", "11"]);
	expect(latest.meta.next_cursor).toBeUndefined();
	expect(latest.meta.cursor).toBeDefined();
	expect(
		ids(await readPage({ ...base, cursor: latest.meta.cursor }, source)),
	).toEqual(["1", "4", "11"]);

	const middle = await readPage(
		{ ...base, cursor: latest.meta.previous_cursor },
		source,
	);
	const oldest = await readPage(
		{ ...base, cursor: middle.meta.previous_cursor },
		source,
	);
	expect([...ids(oldest), ...ids(middle), ...ids(latest)]).toEqual([
		"2",
		"3",
		"6",
		"10",
		"5",
		"12",
		"1",
		"4",
		"11",
	]);
	expect(oldest.meta.previous_cursor).toBeUndefined();

	const newer = await readPage(
		{ ...base, cursor: oldest.meta.next_cursor },
		source,
	);
	const newest = await readPage(
		{ ...base, cursor: newer.meta.next_cursor },
		source,
	);
	expect([...ids(oldest), ...ids(newer), ...ids(newest)]).toEqual([
		"2",
		"3",
		"6",
		"10",
		"5",
		"12",
		"1",
		"4",
		"11",
	]);
	expect(newest.meta.next_cursor).toBeUndefined();
});

test("an exact target beyond Number precision retains its neighbours and pagination cursors", async () => {
	const source = database([
		{ localId: 9007199254740992n, time: 1000 },
		{ localId: 9007199254740993n, time: 1000 },
		{ localId: 9007199254740994n, time: 1000 },
		{ localId: 9007199254740995n, time: 1000 },
	]);
	const target = await readPage(
		{
			...base,
			limit: 1,
			cursor: JSON.stringify({
				condition: "<>",
				messageLocalId: "9007199254740994",
			}),
		},
		source,
	);
	expect(ids(target)).toEqual(["9007199254740993", "9007199254740994"]);
	const before = await readPage(
		{ ...base, cursor: target.meta.previous_cursor },
		source,
	);
	const after = await readPage(
		{ ...base, cursor: target.meta.next_cursor },
		source,
	);
	expect(ids(before)).toEqual(["9007199254740992"]);
	expect(ids(after)).toEqual(["9007199254740995"]);
});
