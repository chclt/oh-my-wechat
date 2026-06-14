import { MessageTypeEnum } from "@repo/types";
import type { Sqlite3Static, SqlValue } from "@sqlite.org/sqlite-wasm";
import CryptoJS from "crypto-js";
import { and, asc, desc, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { drizzle, type SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import WCDB, {
	WCDBDatabaseSeriesName,
	WCDBTableSeriesName,
} from "../../utils/wcdb.ts";
import type { SqlMethod } from "../executor.ts";
import { getChatTable } from "../message.ts";
import { tokenizeForFullTextSearch } from "./tokenizer.ts";

type SourceMessageDatabaseList = SqliteRemoteDatabase<Record<string, never>>[];

interface SourceMessageRow {
	messageLocalId: string;
	createTime: number;
	messageType: MessageTypeEnum;
	messagePlainText: string;
}

/**
 * 官方 sqlite-wasm OO1 的可写内存数据库实例类型。
 */
type WritableInMemoryDatabase = InstanceType<Sqlite3Static["oo1"]["DB"]>;

/**
 * 全文搜索索引的构建状态。
 */
export type MessageSearchIndexStatus =
	| { phase: "idle" }
	| { phase: "building"; indexedMessageCount: number }
	| { phase: "ready"; indexedMessageCount: number }
	| { phase: "failed"; errorMessage: string };

/**
 * 一条搜索命中（定位信息 + 正文 + 相关性分值）。
 *
 * 关于正文：FTS5 contentless 表本身不存正文副本（省去倒排索引的正文冗余，这正是
 * contentless 的核心收益）。但我们在构建索引时已经把每条消息解压成文本，故顺手把
 * 这份正文存进**普通**的元数据旁表 {@link MessageSearchIndex} 的 `messagePlainText`
 * 列里。这样搜索命中后无需再回源读取，省去一整轮按主键回查的往返。
 */
export interface MessageSearchHit {
	/** 命中所在的源分片库序号（对应 `databases.message` 数组下标）。 */
	shardIndex: number;
	/** 命中所在的源聊天表名（`Chat_<md5(username)>`）。 */
	sourceTableName: string;
	/** 会话标识（username，即 `ChatType.id`）；无法从 md5 还原时为空字符串。 */
	chatId: string;
	/** 消息在所属聊天表内的本地主键（`MesLocalID`），字符串化以避免大整数精度问题。 */
	messageLocalId: string;
	/** 消息创建时间（Unix 秒）。 */
	createTime: number;
	/** 消息正文（已解压的纯文本）。 */
	messagePlainText: string;
	/** FTS5 `bm25()` 相关性分值；越小（越负）越相关。 */
	relevance: number;
}

/**
 * 一次搜索的结果（命中分页片段 + 命中总数，供前端分页器使用）。
 */
export interface MessageSearchQueryResult {
	hits: MessageSearchHit[];
	totalCount: number;
}

/**
 * 构建索引时的可选回调与配置。
 */
export interface BuildMessageSearchIndexOptions {
	/** 每索引这么多条消息后让出一次事件循环，避免长时间阻塞 Worker 线程。默认 5000。 */
	yieldEveryMessageCount?: number;
	/** 每次让出/进度更新时调用，用于上报已索引条数。 */
	onProgress?: (indexedMessageCount: number) => void;
}

/**
 * contentless 正文索引表名（FTS5 虚表，`content=''` 不存正文副本）。
 */
const BODY_INDEX_TABLE_NAME = "messageBodyFullTextIndex";
const messageBodyFullTextIndexTable = sqliteTable(BODY_INDEX_TABLE_NAME, {
	rowid: integer("rowid").primaryKey(),
	tokenizedBody: text("tokenizedBody").notNull(),
});

/**
 * 元数据旁表名。contentless FTS5 表除 rowid 外无法 SELECT 出列值，因此把回源
 * 所需的定位信息存到这张普通表里，按 rowid 与正文索引一一对应、JOIN 取回。
 */
const METADATA_TABLE_NAME = "messageSearchMetadata";
const messageSearchMetadataTable = sqliteTable(METADATA_TABLE_NAME, {
	rowid: integer("rowid").primaryKey(),
	shardIndex: integer("shardIndex").notNull(),
	sourceTableName: text("sourceTableName").notNull(),
	chatId: text("chatId").notNull(),
	messageLocalId: text("messageLocalId").notNull(),
	createTime: integer("createTime").notNull(),
	messagePlainText: text("messagePlainText").notNull(),
});

interface MessageSearchIndexBuildTiming {
	listTablesMs: number;
	selectRowsMs: number;
	decompressMs: number;
	tokenizeMs: number;
	insertMs: number;
	yieldMs: number;
	finalCommitMs: number;
}

/**
 * 消息全文搜索索引。
 *
 * 设计要点（详见 `/memories/repo/fts-search.md`）：
 * - **引擎**：官方 `@sqlite.org/sqlite-wasm` 的 FTS5（带 `bm25()`）。
 * - **写入独立内存库**：索引建在一个新建的可写内存数据库里，源库（`databases.message`）
 *   只读、零修改。
 * - **contentless + 旁表**：正文索引用 `content=''` 不存正文副本以省空间；回源
 *   所需的 `shardIndex / sourceTableName / chatId / messageLocalId / createTime`
 *   存在普通旁表里，按 rowid 与正文索引一一对应。
 * - **一元二元预分词**：中文按「单字 + 相邻两字」预分词后存入 `tokenizedBody`，
 *   建索引与查询共用 {@link tokenizeForFullTextSearch}。
 * - **单库合并、逐分片构建**：为保证全局 bm25 排序一致，所有分片的消息建到同一个
 *   索引库里（用 `shardIndex` 列区分来源）；构建时仍逐分片读取源数据。
 */
export class MessageSearchIndex {
	private readonly sqlite3: Sqlite3Static;
	private indexDatabase: WritableInMemoryDatabase | undefined;
	private indexQueryDatabase:
		| SqliteRemoteDatabase<Record<string, never>>
		| undefined;
	private status: MessageSearchIndexStatus = { phase: "idle" };
	private nextRowId = 1;

	constructor(sqlite3: Sqlite3Static) {
		this.sqlite3 = sqlite3;
	}

	/**
	 * 返回当前索引状态（构建中 / 就绪 / 失败 / 空闲）。
	 */
	getStatus(): MessageSearchIndexStatus {
		return this.status;
	}

	/**
	 * 释放索引占用的内存。
	 */
	dispose(): void {
		this.indexDatabase?.close();
		this.indexDatabase = undefined;
		this.indexQueryDatabase = undefined;
		this.status = { phase: "idle" };
		this.nextRowId = 1;
	}

	/**
	 * 从源消息分片库构建全文搜索索引。
	 *
	 * 遍历每个分片里的每张 `Chat_<md5(username)>` 表，读取所有类型的消息。
	 * 当前只有文本消息（`Type=1`）会被转换成纯文本并写入索引；其它类型先显式跳过，
	 * 后续可在同一分支点补充 XML / 链接 / 文件名等内容提取逻辑。
	 *
	 * @param sourceMessageDatabases 源消息分片库的 drizzle 数据库数组。
	 * @param chatIdList 已知的会话标识（username）列表，用于把 `Chat_<md5>`
	 *   表名还原成可读的 username。无法还原的表仍会被索引，只是 `chatId` 为空。
	 * @param options 进度回调与让出频率配置。
	 */
	async build(
		sourceMessageDatabases: SourceMessageDatabaseList,
		chatIdList: string[],
		options: BuildMessageSearchIndexOptions = {},
	): Promise<void> {
		const yieldEveryMessageCount = options.yieldEveryMessageCount ?? 20000;

		console.log("[索引构建] 代码版本 v8（扫描所有消息类型 + 文本入索引）");

		try {
			this.status = { phase: "building", indexedMessageCount: 0 };
			this.initializeIndexDatabase();

			const tableNameToChatId = this.buildTableNameToChatIdMap(chatIdList);

			const indexDatabase = this.requireIndexDatabase();
			const insertBodyStatement = indexDatabase.prepare(
				`INSERT INTO ${BODY_INDEX_TABLE_NAME}(rowid, tokenizedBody) VALUES (?, ?)`,
			);
			const insertMetadataStatement = indexDatabase.prepare(
				`INSERT INTO ${METADATA_TABLE_NAME}` +
					"(rowid, shardIndex, sourceTableName, chatId, messageLocalId, createTime, messagePlainText)" +
					" VALUES (?, ?, ?, ?, ?, ?, ?)",
			);

			const buildStartTime = performance.now();
			const timing: MessageSearchIndexBuildTiming = {
				listTablesMs: 0,
				selectRowsMs: 0,
				decompressMs: 0,
				tokenizeMs: 0,
				insertMs: 0,
				yieldMs: 0,
				finalCommitMs: 0,
			};
			let scannedTableCount = 0;
			let scannedRowCount = 0;
			let indexedMessageCount = 0;

			try {
				indexDatabase.exec("BEGIN");

				for (
					let shardIndex = 0;
					shardIndex < sourceMessageDatabases.length;
					shardIndex++
				) {
					const sourceDatabase = sourceMessageDatabases[shardIndex];
					const listStartTime = performance.now();
					const chatTableNames = await this.listChatTableNames(sourceDatabase);
					timing.listTablesMs += performance.now() - listStartTime;
					scannedTableCount += chatTableNames.length;

					for (const sourceTableName of chatTableNames) {
						const chatId = tableNameToChatId.get(sourceTableName) ?? "";

						const sourceMessageRows = await this.readSourceMessageRows(
							sourceDatabase,
							sourceTableName,
							timing,
						);
						scannedRowCount += sourceMessageRows.length;

						for (const sourceMessageRow of sourceMessageRows) {
							const indexableMessagePlainText =
								this.extractIndexablePlainText(sourceMessageRow);
							if (indexableMessagePlainText === undefined) {
								continue;
							}

							const tokenizeStartTime = performance.now();
							const tokenizedBody = tokenizeForFullTextSearch(
								indexableMessagePlainText,
							);
							timing.tokenizeMs += performance.now() - tokenizeStartTime;
							if (tokenizedBody.length === 0) {
								continue;
							}

							const rowId = this.nextRowId++;

							const insertStartTime = performance.now();
							insertBodyStatement.bind([rowId, tokenizedBody]);
							insertBodyStatement.step();
							insertBodyStatement.reset();

							insertMetadataStatement.bind([
								rowId,
								shardIndex,
								sourceTableName,
								chatId,
								sourceMessageRow.messageLocalId,
								sourceMessageRow.createTime,
								indexableMessagePlainText,
							]);
							insertMetadataStatement.step();
							insertMetadataStatement.reset();
							timing.insertMs += performance.now() - insertStartTime;

							indexedMessageCount++;

							if (indexedMessageCount % yieldEveryMessageCount === 0) {
								this.status = {
									phase: "building",
									indexedMessageCount,
								};
								options.onProgress?.(indexedMessageCount);
								const yieldStartTime = performance.now();
								await yieldToEventLoop();
								timing.yieldMs += performance.now() - yieldStartTime;
							}
						}
					}
				}

				const finalCommitStartTime = performance.now();
				indexDatabase.exec("COMMIT");
				timing.finalCommitMs += performance.now() - finalCommitStartTime;
			} finally {
				insertBodyStatement.finalize();
				insertMetadataStatement.finalize();
			}

			const totalMs = performance.now() - buildStartTime;
			console.log(
				`[索引构建] 总耗时 ${totalMs.toFixed(0)}ms | 表数 ${scannedTableCount}` +
					` | 读到行数 ${scannedRowCount} | 入索引 ${indexedMessageCount}\n` +
					`  列举表 ${timing.listTablesMs.toFixed(0)}ms` +
					` | 查询取行 ${timing.selectRowsMs.toFixed(0)}ms` +
					` | 解压(postProcess) ${timing.decompressMs.toFixed(0)}ms` +
					` | 分词 ${timing.tokenizeMs.toFixed(0)}ms` +
					` | 插入索引 ${timing.insertMs.toFixed(0)}ms` +
					` | 中途让出 ${timing.yieldMs.toFixed(0)}ms` +
					` | 末次提交 ${timing.finalCommitMs.toFixed(0)}ms`,
			);

			this.status = { phase: "ready", indexedMessageCount };
			options.onProgress?.(indexedMessageCount);
		} catch (error) {
			this.status = {
				phase: "failed",
				errorMessage: error instanceof Error ? error.message : String(error),
			};
			throw error;
		}
	}

	/**
	 * 在索引中搜索。
	 *
	 * @param matchExpression 已由 {@link buildFullTextMatchExpression} 生成的 FTS5
	 *   `MATCH` 表达式（调用方负责分词；空表达式应在调用前拦截）。
	 * @param chatId 若提供，则只在该会话内搜索（单聊搜索）；否则全局搜索。
	 * @param startTime 若提供，则只返回 `createTime >= startTime` 的消息。
	 * @param endTime 若提供，则只返回 `createTime <= endTime` 的消息。
	 * @param offset 结果偏移量。
	 * @param limit 结果条数上限。
	 */
	async search(parameters: {
		matchExpression: string;
		chatId?: string;
		startTime?: number;
		endTime?: number;
		offset: number;
		limit: number;
	}): Promise<MessageSearchQueryResult> {
		const indexDatabase = this.requireIndexQueryDatabase();
		const { matchExpression, chatId, startTime, endTime, offset, limit } =
			parameters;

		const relevanceExpression = sql<number>`bm25(${sql.raw(
			BODY_INDEX_TABLE_NAME,
		)})`;

		const hits = await indexDatabase
			.select({
				shardIndex: messageSearchMetadataTable.shardIndex,
				sourceTableName: messageSearchMetadataTable.sourceTableName,
				chatId: messageSearchMetadataTable.chatId,
				messageLocalId: messageSearchMetadataTable.messageLocalId,
				createTime: messageSearchMetadataTable.createTime,
				messagePlainText: messageSearchMetadataTable.messagePlainText,
				relevance: relevanceExpression,
			})
			.from(messageBodyFullTextIndexTable)
			.innerJoin(
				messageSearchMetadataTable,
				eq(
					messageSearchMetadataTable.rowid,
					messageBodyFullTextIndexTable.rowid,
				),
			)
			.where(
				and(
					...this.buildMetadataFilterConditions({
						matchExpression,
						chatId,
						startTime,
						endTime,
					}),
				),
			)
			.orderBy(
				asc(relevanceExpression),
				desc(messageSearchMetadataTable.createTime),
			)
			.limit(limit)
			.offset(offset);

		const totalCount = await this.countMatches({
			matchExpression,
			chatId,
			startTime,
			endTime,
		});

		return { hits, totalCount };
	}

	/**
	 * 统计某次查询的命中总数（供分页器显示总数 / 计算总页数）。
	 */
	private async countMatches(parameters: {
		matchExpression: string;
		chatId?: string;
		startTime?: number;
		endTime?: number;
	}): Promise<number> {
		const indexDatabase = this.requireIndexQueryDatabase();
		const [countRow] = await indexDatabase
			.select({
				matchedCount: sql<number>`count(*)`,
			})
			.from(messageBodyFullTextIndexTable)
			.innerJoin(
				messageSearchMetadataTable,
				eq(
					messageSearchMetadataTable.rowid,
					messageBodyFullTextIndexTable.rowid,
				),
			)
			.where(and(...this.buildMetadataFilterConditions(parameters)));

		return Number(countRow?.matchedCount ?? 0);
	}

	private buildMetadataFilterConditions(parameters: {
		matchExpression: string;
		chatId?: string;
		startTime?: number;
		endTime?: number;
	}): SQL[] {
		const conditions: SQL[] = [
			sql`${sql.raw(BODY_INDEX_TABLE_NAME)} MATCH ${parameters.matchExpression}`,
		];

		if (parameters.chatId) {
			conditions.push(eq(messageSearchMetadataTable.chatId, parameters.chatId));
		}
		if (parameters.startTime !== undefined) {
			conditions.push(
				gte(messageSearchMetadataTable.createTime, parameters.startTime),
			);
		}
		if (parameters.endTime !== undefined) {
			conditions.push(
				lte(messageSearchMetadataTable.createTime, parameters.endTime),
			);
		}

		return conditions;
	}

	/**
	 * 新建可写内存索引库并建表（contentless 正文索引 + 元数据旁表）。
	 */
	private initializeIndexDatabase(): void {
		this.indexDatabase?.close();
		this.indexQueryDatabase = undefined;
		this.nextRowId = 1;

		const indexDatabase = new this.sqlite3.oo1.DB();
		indexDatabase.exec(
			`CREATE VIRTUAL TABLE ${BODY_INDEX_TABLE_NAME}` +
				" USING fts5(tokenizedBody, content='')",
		);
		indexDatabase.exec(
			`CREATE TABLE ${METADATA_TABLE_NAME} (` +
				" rowid INTEGER PRIMARY KEY," +
				" shardIndex INTEGER NOT NULL," +
				" sourceTableName TEXT NOT NULL," +
				" chatId TEXT NOT NULL," +
				" messageLocalId TEXT NOT NULL," +
				" createTime INTEGER NOT NULL," +
				" messagePlainText TEXT NOT NULL" +
				")",
		);
		indexDatabase.exec(
			`CREATE INDEX messageSearchMetadataChatIdIndex` +
				` ON ${METADATA_TABLE_NAME} (chatId)`,
		);

		this.indexDatabase = indexDatabase;
		this.indexQueryDatabase = drizzle(async (query, params, method) =>
			this.executeIndexQuery(indexDatabase, query, params, method),
		);
	}

	private requireIndexDatabase(): WritableInMemoryDatabase {
		if (!this.indexDatabase) {
			throw new Error("消息全文搜索索引尚未构建");
		}
		return this.indexDatabase;
	}

	private requireIndexQueryDatabase(): SqliteRemoteDatabase<
		Record<string, never>
	> {
		if (!this.indexQueryDatabase) {
			throw new Error("消息全文搜索索引尚未构建");
		}
		return this.indexQueryDatabase;
	}

	private executeIndexQuery(
		indexDatabase: WritableInMemoryDatabase,
		query: string,
		params: unknown[],
		method: SqlMethod,
	): Promise<{ rows: SqlValue[] | SqlValue[][] }> {
		const statement = indexDatabase.prepare(query);
		try {
			if (params.length > 0) {
				statement.bind(params as SqlValue[]);
			}

			if (method === "get") {
				const row = statement.step() ? statement.get([]) : [];
				return Promise.resolve({ rows: row });
			}

			if (method === "run") {
				statement.step();
				return Promise.resolve({ rows: [] });
			}

			const rows: SqlValue[][] = [];
			while (statement.step()) {
				rows.push(statement.get([]));
			}
			return Promise.resolve({ rows });
		} finally {
			statement.finalize();
		}
	}

	/**
	 * 用已知 username 列表构建「`Chat_<md5(username)>` 表名 → username」映射。
	 */
	private buildTableNameToChatIdMap(chatIdList: string[]): Map<string, string> {
		const tableNameToChatId = new Map<string, string>();
		for (const chatId of chatIdList) {
			const sourceTableName = `Chat_${CryptoJS.MD5(chatId).toString()}`;
			tableNameToChatId.set(sourceTableName, chatId);
		}
		return tableNameToChatId;
	}

	/**
	 * 列出某个源分片库里的所有 `Chat_<md5>` 表名。
	 */
	private async listChatTableNames(
		sourceDatabase: SqliteRemoteDatabase<Record<string, never>>,
	): Promise<string[]> {
		const tableRows = await sourceDatabase
			.select({ name: sql<string>`name` })
			.from(sql`sqlite_master`)
			.where(
				and(
					eq(sql`type`, "table"),
					sql`name LIKE ${"Chat\\_%"} ESCAPE ${"\\"}`,
				),
			)
			.all();

		return tableRows.map((tableRow) => String(tableRow.name));
	}

	/**
	 * 读取某张聊天表里的所有消息，保留消息类型以便后续按类型提取可索引文本。
	 * 当前只有文本消息会经 {@link WCDB.postProcess} 解压成纯文本，其它类型先保留
	 * 定位信息并跳过正文处理；未来可在 {@link extractIndexablePlainText} 中逐类补齐。
	 */
	private async readSourceMessageRows(
		sourceDatabase: SqliteRemoteDatabase<Record<string, never>>,
		sourceTableName: string,
		timing?: { selectRowsMs: number; decompressMs: number },
	): Promise<SourceMessageRow[]> {
		const sourceChatTable = getChatTable(sourceTableName);
		const selectStartTime = performance.now();
		const rawRows = await sourceDatabase
			.select({
				MesLocalID: sql<string>`CAST(${sourceChatTable.MesLocalID} AS TEXT)`.as(
					"MesLocalID",
				),
				CreateTime: sourceChatTable.CreateTime,
				Type: sourceChatTable.Type,
				Message: sourceChatTable.Message,
			})
			.from(sourceChatTable);
		if (timing) timing.selectRowsMs += performance.now() - selectStartTime;

		const textRawRows = rawRows.filter(
			(rawRow) => rawRow.Type === MessageTypeEnum.TEXT,
		);
		const decompressStartTime = performance.now();
		const { result: decompressedTextRows } = await WCDB.postProcess(
			textRawRows,
			{
				databaseSeries: WCDBDatabaseSeriesName.Message,
				tableSeries: WCDBTableSeriesName.Chat,
			},
		);
		if (timing) timing.decompressMs += performance.now() - decompressStartTime;

		const textMessageByLocalId = new Map<string, unknown>();
		for (const decompressedRow of decompressedTextRows) {
			textMessageByLocalId.set(
				String(decompressedRow.MesLocalID),
				decompressedRow.Message,
			);
		}

		const sourceMessageRows: SourceMessageRow[] = [];

		for (const rawRow of rawRows) {
			const messageLocalId = String(rawRow.MesLocalID);
			const messageType = rawRow.Type;
			const messageValue =
				messageType === MessageTypeEnum.TEXT
					? textMessageByLocalId.get(messageLocalId)
					: undefined;

			if (messageType === MessageTypeEnum.TEXT && messageValue == null) {
				continue;
			}

			sourceMessageRows.push({
				messageLocalId,
				createTime: Number(rawRow.CreateTime),
				messageType,
				messagePlainText:
					messageType === MessageTypeEnum.TEXT ? String(messageValue) : "",
			});
		}

		return sourceMessageRows;
	}

	/**
	 * 将不同类型的源消息转换成可进入全文索引的纯文本。当前只支持文本消息；
	 * 其它类型先显式跳过，后续 XML / 链接 / 文件名等提取逻辑从这里扩展。
	 */
	private extractIndexablePlainText(
		sourceMessageRow: SourceMessageRow,
	): string | undefined {
		switch (sourceMessageRow.messageType) {
			case MessageTypeEnum.TEXT:
				return sourceMessageRow.messagePlainText;
			default:
				return undefined;
		}
	}
}

/**
 * 让出当前宏任务，给事件循环喘息的机会（让出后可处理 postMessage 等，刷新进度）。
 *
 * 不用 `setTimeout(resolve, 0)`：浏览器对 `setTimeout` 有最小间隔钳制（clamping），
 * 在 Worker / 后台标签页里实测每次可达约 170ms，几十次让出会累积成数秒的纯等待。
 * 改用 `MessageChannel` 的 `postMessage`，它在宏任务层让出但不受 setTimeout 钳制，
 * 单次成本是亚毫秒级。
 */
function yieldToEventLoop(): Promise<void> {
	return new Promise((resolve) => {
		const messageChannel = new MessageChannel();
		messageChannel.port1.onmessage = () => {
			messageChannel.port1.close();
			resolve();
		};
		messageChannel.port2.postMessage(undefined);
	});
}
