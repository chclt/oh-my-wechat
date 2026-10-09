import { MessageDirection, MessageTypeEnum, type UserType } from "@repo/types";
import type { SearchMessagesRequest } from "@repo/types/adapter";
import sqlite3InitModule, { type Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import CryptoJS from "crypto-js";
import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";
import {
	type DatabaseExecutor,
	drizzleFromExecutor,
	executorFromWasmDatabase,
} from "./database/executor.ts";
import { MessageSearchIndex } from "./database/fts/message-search-index.ts";
import { MessageSearchSession } from "./message-search-session.ts";
import type { WCDatabases } from "./types.ts";

let sqlite3: Sqlite3Static;
let executor: DatabaseExecutor;
let databases: WCDatabases;
const account: UserType = {
	id: "account",
	user_id: "account",
	username: "Account",
	is_openim: false,
};
const sessions: MessageSearchSession[] = [];
const gates: Array<() => void> = [];
const request: SearchMessagesRequest = {
	account: { id: "account" },
	searchText: "needle",
	offset: 0,
	limit: 20,
};

beforeAll(async () => {
	sqlite3 = await sqlite3InitModule();
	const source = new sqlite3.oo1.DB();
	executor = executorFromWasmDatabase(source);
	const database = drizzleFromExecutor(executor);
	databases = { session: database, WCDB_Contact: database };
	source.exec(`
		CREATE TABLE SessionAbstract (UsrName TEXT, ConIntRes1 INTEGER, CreateTime INTEGER);
		INSERT INTO SessionAbstract VALUES ('chat', 0, 0);
		CREATE TABLE Friend (
			username TEXT, type INTEGER, dbContactProfile BLOB, dbContactHeadImage BLOB,
			dbContactRemark BLOB, dbContactSocial BLOB, dbContactChatRoom BLOB, dbContactOpenIM BLOB
		);
		CREATE TABLE OpenIMContact AS SELECT * FROM Friend;
	`);
	const tableName = `Chat_${CryptoJS.MD5("chat").toString()}`;
	source.exec(
		`CREATE TABLE ${tableName} (MesLocalID INTEGER, CreateTime INTEGER, Type INTEGER, Message TEXT, Des INTEGER)`,
	);
	source.exec({
		sql: `INSERT INTO ${tableName} VALUES (?, ?, ?, ?, ?)`,
		bind: [1, 1000, MessageTypeEnum.TEXT, "needle", MessageDirection.incoming],
	});
});
afterEach(async () => {
	for (const resolve of gates.splice(0)) resolve();
	for (const session of sessions.splice(0)) await session.dispose();
});
afterAll(() => executor.close());

function gate() {
	let resolve!: () => void;
	const promise = new Promise<void>((done) => {
		resolve = done;
	});
	gates.push(resolve);
	return { promise, resolve };
}

function createSession(waiting: Promise<void>) {
	const index = new MessageSearchIndex(sqlite3);
	const build = vi.fn(async (signal: AbortSignal) => {
		await waiting;
		await index.build([drizzleFromExecutor(executor)], ["chat"], account.id, {
			signal,
		});
	});
	const session = new MessageSearchSession("account", index, build);
	sessions.push(session);
	return { session, index, build };
}

test("preload and concurrent searches build once and return complete results", async () => {
	const waiting = gate();
	const { session, build } = createSession(waiting.promise);
	const preload = session.preload();
	const first = session.search(request, { account, databases });
	const second = session.search(request, { account, databases });
	waiting.resolve();
	await preload;

	expect((await first).data.map((hit) => hit.messageLocalId)).toEqual(["1"]);
	expect((await second).data.map((hit) => hit.messageLocalId)).toEqual(["1"]);
	expect(build).toHaveBeenCalledTimes(1);
	expect(session.getStatus("account")).toEqual({
		phase: "ready",
		indexedMessageCount: 1,
	});
});

test("disposing an account rejects pending searches and waits for its active build to finish", async () => {
	const waiting = gate();
	const { session, index } = createSession(waiting.promise);
	const preload = session.preload();
	const rejected = expect(
		session.search(request, { account, databases }),
	).rejects.toThrow();
	let cleanupDone = false;
	const cleanup = session.dispose().then(() => {
		cleanupDone = true;
	});
	await rejected;
	await preload;
	expect(cleanupDone).toBe(false);

	waiting.resolve();
	await cleanup;
	expect(cleanupDone).toBe(true);
	expect(index.getStatus()).toEqual({ phase: "idle" });
});
