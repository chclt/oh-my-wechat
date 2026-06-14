import type { Sqlite3Static, SqlValue } from "@sqlite.org/sqlite-wasm";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";

/**
 * drizzle-orm/sqlite-proxy 约定的执行方法。
 */
export type SqlMethod = "run" | "all" | "values" | "get";

/**
 * 统一的「数据库执行器」接口。两端（浏览器 sqlite-wasm / Electron better-sqlite3）
 * 各实现一份，controllers 与 schema 通过 drizzle-orm/sqlite-proxy 共用此抽象。
 *
 * 返回的行必须是「按 SELECT 列顺序的值数组」（positional），由 drizzle 自行映射列名。
 */
export interface DatabaseExecutor {
	exec(
		sql: string,
		params: unknown[],
		method: SqlMethod,
	): Promise<{ rows: SqlValue[] | SqlValue[][] }>;
	/**
	 * 原生只读查询：直接返回「按列名键控的对象」数组，BLOB 列保留为 `Uint8Array`。
	 *
	 * 这是为**建索引等热路径**准备的快速通道：它绕过 drizzle-orm/sqlite-proxy 的
	 * 异步回调与逐行「值数组 → 对象」映射开销（实测在数十万行规模下，这层开销是
	 * 索引构建的主要瓶颈）。同步执行（浏览器 wasm 与 Electron better-sqlite3 的底层
	 * 查询都是同步的），Electron 端可用 better-sqlite3 的 `prepare(sql).all(...)` 实现。
	 *
	 * 注意：BLOB 原样返回为 `Uint8Array`，调用方需自行处理（参见 `WCDB.postProcess`）。
	 */
	selectObjects(sql: string, params?: unknown[]): Record<string, SqlValue>[];
	close(): void;
}

/**
 * SQLite 文件头魔数（前 16 字节）："SQLite format 3\0"。
 */
const SQLITE_HEADER = "SQLite format 3\u0000";

/**
 * 把（已 checkpoint 的）WAL 模式数据库文件头的「日志模式」标记重置为 rollback。
 *
 * iOS 备份里的 WCDB 文件（Manifest.db / session.db / message_*.sqlite /
 * WCDB_Contact.sqlite）通常是 WAL 模式（文件头偏移 18/19 = 2）。备份时已完整
 * checkpoint，所有数据都在主文件里，但文件头仍声明 WAL。用 `sqlite3_deserialize`
 * 加载到内存（没有 `-wal` 伴随文件）后，任何读取都会以 `SQLITE_CANTOPEN`
 * （unable to open database file）失败。
 *
 * 这里在我们自己的字节副本上把偏移 18/19 由 2 改回 1（rollback journal），
 * 让官方 wasm 把它当普通库打开。源文件零修改，且数据已 checkpoint，无损。
 */
function normalizeWalJournalModeHeader(bytes: Uint8Array): void {
	if (bytes.length < 20) return;
	for (let i = 0; i < SQLITE_HEADER.length; i++) {
		if (bytes[i] !== SQLITE_HEADER.charCodeAt(i)) return;
	}
	// 偏移 18 = write version，19 = read version；2 = WAL。
	if (bytes[18] === 2 && bytes[19] === 2) {
		bytes[18] = 1;
		bytes[19] = 1;
	}
}

/**
 * 浏览器实现：用官方 `@sqlite.org/sqlite-wasm` 的 OO1 API，以**只读**方式
 * 把字节库加载进内存（`sqlite3_deserialize`，源库零修改）。
 */
export function createWasmExecutor(
	bytes: Uint8Array,
	sqlite3: Sqlite3Static,
): DatabaseExecutor {
	const { capi, wasm, oo1 } = sqlite3;

	// 传入的是 worker 新建的独立副本，可安全原地修改（不影响源文件）。
	normalizeWalJournalModeHeader(bytes);

	const db = new oo1.DB();

	const dataPointer = wasm.allocFromTypedArray(bytes);
	const flags =
		capi.SQLITE_DESERIALIZE_FREEONCLOSE | capi.SQLITE_DESERIALIZE_READONLY;
	const rc = capi.sqlite3_deserialize(
		db.pointer!,
		"main",
		dataPointer,
		bytes.length,
		bytes.length,
		flags,
	);
	db.checkRc(rc);

	return {
		async exec(sql, params, method) {
			// `prepare` 可能直接抛 SQLite3Error（例如 "no such table"）。这是预期
			// 情况（按设计每个 Chat_ 表只存在于某一个 message_N 库），交由上层
			// 判定处理；drizzle 会把它包成 DrizzleQueryError 并保留在 `.cause`。
			const stmt = db.prepare(sql);
			try {
				if (params.length) {
					stmt.bind(params as SqlValue[]);
				}

				if (method === "get") {
					const row = stmt.step() ? stmt.get([]) : [];
					return { rows: row };
				}

				const rows: SqlValue[][] = [];
				while (stmt.step()) {
					rows.push(stmt.get([]));
				}
				return { rows };
			} finally {
				stmt.finalize();
			}
		},
		selectObjects(sql, params) {
			const stmt = db.prepare(sql);
			try {
				if (params && params.length) {
					stmt.bind(params as SqlValue[]);
				}

				const rows: Record<string, SqlValue>[] = [];
				while (stmt.step()) {
					// `get({})` 返回「列名 → 值」对象；BLOB 列为 Uint8Array。
					rows.push(stmt.get({}) as Record<string, SqlValue>);
				}
				return rows;
			} finally {
				stmt.finalize();
			}
		},
		close() {
			db.close();
		},
	};
}

/**
 * 把执行器包成带完整类型推断的 drizzle 实例。返回类型即 `SqliteRemoteDatabase`，
 * controllers 用法与原 sql-js 版同构。
 */
export function drizzleFromExecutor(
	executor: DatabaseExecutor,
): SqliteRemoteDatabase<Record<string, never>> {
	return drizzle(async (sql, params, method) =>
		executor.exec(sql, params, method),
	);
}
