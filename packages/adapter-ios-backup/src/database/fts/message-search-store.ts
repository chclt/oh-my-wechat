import type { Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import {
	and,
	asc,
	desc,
	eq,
	getTableColumns,
	getTableName,
	gte,
	lte,
	sql,
} from "drizzle-orm";
import { drizzleFromExecutor, executorFromWasmDatabase } from "../executor.ts";
import type { MessageSearchPerformance } from "./message-search-performance.ts";
import {
	MESSAGE_SEARCH_SCHEMA_SQL,
	messageBodyFullTextIndexTable,
	messageSearchMetadataTable,
	type MessageSearchMetadata,
} from "./message-search-schema.ts";

export interface MessageSearchStoreQuery {
	matchExpression: string;
	chatId?: string;
	startTime?: number;
	endTime?: number;
	offset: number;
	limit: number;
}

export type MessageSearchStoredHit = MessageSearchMetadata & {
	relevance: number;
};
type InsertDocument = (
	document: MessageSearchMetadata,
	tokenizedBody: string,
) => void;
type Database = InstanceType<Sqlite3Static["oo1"]["DB"]>;

const { rowid, ...metadataColumns } = getTableColumns(
	messageSearchMetadataTable,
);
const joinCondition = eq(rowid, messageBodyFullTextIndexTable.rowid);
const relevance = sql<number>`bm25(${messageBodyFullTextIndexTable})`;

/** Owns the private index database, its native bulk writer and typed search queries. */
export class MessageSearchStore {
	private readonly database: Database;
	private readonly executor;
	private readonly queryDatabase;

	constructor(sqlite3: Sqlite3Static) {
		this.database = new sqlite3.oo1.DB();
		this.executor = executorFromWasmDatabase(this.database);
		this.queryDatabase = drizzleFromExecutor(this.executor);
		try {
			this.database.exec(MESSAGE_SEARCH_SCHEMA_SQL);
		} catch (error) {
			this.close();
			throw error;
		}
	}

	close(): void {
		this.executor.close();
	}

	/** Populate a fresh store in one transaction. */
	async populate(
		write: (insert: InsertDocument) => Promise<void>,
		signal?: AbortSignal,
		profiler?: MessageSearchPerformance,
	): Promise<void> {
		signal?.throwIfAborted();
		// BEGIN stays outside cleanup so a rejected nested transaction cannot close its owner.
		this.database.exec("BEGIN");
		try {
			let bodyStatement: ReturnType<Database["prepare"]> | undefined;
			let metadataStatement: ReturnType<Database["prepare"]> | undefined;
			try {
				bodyStatement = this.database.prepare(
					`INSERT INTO ${getTableName(messageBodyFullTextIndexTable)} (rowid, tokenizedBody) VALUES (?, ?)`,
				);
				metadataStatement = this.database.prepare(
					`INSERT INTO ${getTableName(messageSearchMetadataTable)}
						(rowid, shardIndex, sourceTableName, chatId, messageLocalId, createTime, messagePlainText)
						VALUES (?, ?, ?, ?, ?, ?, ?)`,
				);
				const body = bodyStatement;
				const metadata = metadataStatement;
				let nextRowId = 1;
				await write((document, tokenizedBody) => {
					const rowId = nextRowId++;
					body.bind([rowId, tokenizedBody]);
					body.step();
					body.reset();
					metadata.bind([
						rowId,
						document.shardIndex,
						document.sourceTableName,
						document.chatId,
						document.messageLocalId,
						document.createTime,
						document.messagePlainText,
					]);
					metadata.step();
					metadata.reset();
				});
				signal?.throwIfAborted();
				profiler?.start("commit");
				this.database.exec("COMMIT");
				profiler?.end("commit");
			} finally {
				bodyStatement?.finalize();
				metadataStatement?.finalize();
			}
		} catch (error) {
			// Discarding a failed private database rolls back both tables together.
			this.close();
			throw error;
		}
	}

	async search(parameters: MessageSearchStoreQuery): Promise<{
		hits: MessageSearchStoredHit[];
		totalCount: number;
	}> {
		const { matchExpression, chatId, startTime, endTime, offset, limit } =
			parameters;
		const condition = and(
			sql`${messageBodyFullTextIndexTable} MATCH ${matchExpression}`,
			chatId ? eq(messageSearchMetadataTable.chatId, chatId) : undefined,
			startTime !== undefined
				? gte(messageSearchMetadataTable.createTime, startTime)
				: undefined,
			endTime !== undefined
				? lte(messageSearchMetadataTable.createTime, endTime)
				: undefined,
		);
		const hits = await this.queryDatabase
			.select({ ...metadataColumns, relevance })
			.from(messageBodyFullTextIndexTable)
			.innerJoin(messageSearchMetadataTable, joinCondition)
			.where(condition)
			.orderBy(
				asc(relevance),
				desc(messageSearchMetadataTable.createTime),
				asc(rowid),
			)
			.limit(limit)
			.offset(offset);
		const [count] = await this.queryDatabase
			.select({ total: sql<number>`count(*)` })
			.from(messageBodyFullTextIndexTable)
			.innerJoin(messageSearchMetadataTable, joinCondition)
			.where(condition);
		return { hits, totalCount: count.total };
	}
}
