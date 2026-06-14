import sqlite3InitModule, { Sqlite3Static } from "@sqlite.org/sqlite-wasm";

let getSqlite3Promise: Promise<Sqlite3Static> | undefined;

export function getSqlite3(): Promise<Sqlite3Static> {
	if (!getSqlite3Promise) {
		getSqlite3Promise = sqlite3InitModule();
	}
	return getSqlite3Promise;
}
