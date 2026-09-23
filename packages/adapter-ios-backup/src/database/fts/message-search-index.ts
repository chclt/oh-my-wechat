import type {
	GetMessageSearchIndexStatusResponse,
	MessageSearchMatch,
} from "@repo/types/adapter";
import type { Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import { MessageSearchPerformance } from "./message-search-performance.ts";
import {
	createMessageSearchTableMap,
	listMessageSearchTables,
	readMessageSearchDocuments,
} from "./message-search-source.ts";
import {
	MessageSearchStore,
	type MessageSearchStoredHit,
	type MessageSearchStoreQuery,
} from "./message-search-store.ts";
import {
	createMessageSearchQuery,
	tokenizeMessageText,
} from "./message-search-text.ts";

export type MessageSearchIndexStatus =
	Awaited<GetMessageSearchIndexStatusResponse>;
export type MessageSearchHit = MessageSearchStoredHit & {
	match: MessageSearchMatch;
};
export interface MessageSearchQueryResult {
	hits: MessageSearchHit[];
	totalCount: number;
}

export interface BuildMessageSearchIndexOptions {
	signal?: AbortSignal;
	/** Enable build timing and its summary log. Disabled by default. */
	debug?: boolean;
	/** 每索引这么多条消息后让出一次事件循环，避免长时间阻塞 Worker 线程。默认 20000。 */
	yieldEveryMessageCount?: number;
	/** 每次让出/进度更新时调用，用于上报已索引条数。 */
	onProgress?: (indexedMessageCount: number) => void;
}

/** Coordinates source extraction, tokenization and progress; exposes only a complete index. */
export class MessageSearchIndex {
	private store: MessageSearchStore | undefined;
	private status: MessageSearchIndexStatus = { phase: "idle" };

	constructor(private readonly sqlite3: Sqlite3Static) {}

	getStatus(): MessageSearchIndexStatus {
		return this.status;
	}

	dispose(): void {
		this.store?.close();
		this.store = undefined;
		this.status = { phase: "idle" };
	}

	/** Unknown chat table names remain indexed with an empty chatId. */
	async build(
		sourceMessageDatabases: SqliteRemoteDatabase<Record<string, never>>[],
		chatIdList: string[],
		options: BuildMessageSearchIndexOptions = {},
	): Promise<void> {
		const yieldEveryMessageCount = options.yieldEveryMessageCount ?? 20000;
		const { signal } = options;

		try {
			signal?.throwIfAborted();
			this.dispose();
			this.status = { phase: "building", indexedMessageCount: 0 };
			const store = new MessageSearchStore(this.sqlite3);
			const tableNameToChatId = createMessageSearchTableMap(chatIdList);
			const profiler = options.debug
				? new MessageSearchPerformance()
				: undefined;
			let indexedMessageCount = 0;

			await store.populate(
				async (insert) => {
					for (
						let shardIndex = 0;
						shardIndex < sourceMessageDatabases.length;
						shardIndex++
					) {
						const sourceDatabase = sourceMessageDatabases[shardIndex];
						profiler?.start("listTables");
						const chatTableNames =
							await listMessageSearchTables(sourceDatabase);
						profiler?.end("listTables");
						profiler?.count("tables", chatTableNames.length);

						for (const sourceTableName of chatTableNames) {
							const chatId = tableNameToChatId.get(sourceTableName) ?? "";
							signal?.throwIfAborted();

							const sourceBatch = await readMessageSearchDocuments(
								sourceDatabase,
								sourceTableName,
								profiler,
							);
							signal?.throwIfAborted();
							profiler?.count("rows", sourceBatch.scannedRowCount);

							for (const document of sourceBatch.documents) {
								profiler?.start("tokenize");
								const tokenizedBody = tokenizeMessageText(
									document.messagePlainText,
								);
								profiler?.end("tokenize");
								if (tokenizedBody.length === 0) continue;

								profiler?.start("insert");
								insert(
									{ ...document, shardIndex, sourceTableName, chatId },
									tokenizedBody,
								);
								profiler?.end("insert");
								indexedMessageCount++;

								if (indexedMessageCount % yieldEveryMessageCount === 0) {
									this.status = { phase: "building", indexedMessageCount };
									options.onProgress?.(indexedMessageCount);
									profiler?.start("yield");
									await yieldToEventLoop();
									signal?.throwIfAborted();
									profiler?.end("yield");
								}
							}
						}
					}
				},
				signal,
				profiler,
			);

			this.store = store;
			profiler?.log(indexedMessageCount);

			this.status = { phase: "ready", indexedMessageCount };
			options.onProgress?.(indexedMessageCount);
		} catch (error) {
			this.dispose();
			this.status = {
				phase: "failed",
				errorMessage: (error as Error).message,
			};
			throw error;
		}
	}

	async search(
		parameters: Omit<MessageSearchStoreQuery, "matchExpression"> & {
			searchText: string;
		},
	): Promise<MessageSearchQueryResult> {
		const { searchText, ...filters } = parameters;
		const query = createMessageSearchQuery(searchText);
		if (!query) return { hits: [], totalCount: 0 };
		const result = await this.store!.search({
			...filters,
			matchExpression: query.matchExpression,
		});
		return {
			...result,
			hits: result.hits.map((hit) => ({
				...hit,
				match: query.findMatch(hit.messagePlainText)!,
			})),
		};
	}
}

/** Yield to Worker messages without setTimeout's background-tab timer clamping. */
function yieldToEventLoop(): Promise<void> {
	return new Promise((resolve) => {
		const messageChannel = new MessageChannel();
		messageChannel.port1.onmessage = () => {
			messageChannel.port1.close();
			messageChannel.port2.close();
			resolve();
		};
		messageChannel.port2.postMessage(undefined);
	});
}
