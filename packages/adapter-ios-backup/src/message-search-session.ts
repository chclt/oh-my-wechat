import type { SearchMessagesRequest } from "@repo/types/adapter";
import { QueryClient, type QueryFunctionContext } from "@tanstack/query-core";
import { searchMessages } from "./controllers/message-search.ts";
import type {
	MessageSearchIndex,
	MessageSearchIndexStatus,
} from "./database/fts/message-search-index.ts";

/** Owns one account's index. Query manages readiness; this session owns native resources. */
export class MessageSearchSession {
	private readonly client = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: Infinity,
				gcTime: Infinity,
				networkMode: "always",
				retry: false,
				structuralSharing: false,
			},
		},
	});
	private disposed = false;
	private buildCompletion: Promise<void> = Promise.resolve();
	private readonly queryOptions;

	constructor(
		readonly accountId: string,
		private readonly index: MessageSearchIndex,
		build: (signal: AbortSignal) => Promise<void>,
	) {
		this.queryOptions = {
			queryKey: ["messageSearchIndex", accountId],
			queryFn: ({ signal }: QueryFunctionContext) => {
				const task = (async () => {
					try {
						await build(signal);
						signal.throwIfAborted();
						return index;
					} finally {
						if (this.disposed) index.dispose();
					}
				})();
				// Track physical completion only, so the Worker can safely release source databases.
				this.buildCompletion = task.then(
					() => {},
					() => {},
				);
				return task;
			},
		};
	}

	preload(): Promise<void> {
		return this.client.prefetchQuery(this.queryOptions);
	}

	async search(request: SearchMessagesRequest) {
		this.assertActive(request.account.id);
		const index = await this.client.ensureQueryData(this.queryOptions);
		this.assertActive(request.account.id);
		const result = await searchMessages(request, { messageSearchIndex: index });
		this.assertActive(request.account.id);
		return result;
	}

	getStatus(accountId: string): MessageSearchIndexStatus {
		if (this.disposed || accountId !== this.accountId) return { phase: "idle" };
		const query = this.client.getQueryState(this.queryOptions.queryKey);
		if (query?.status === "error") {
			return {
				phase: "failed",
				errorMessage: query.error!.message,
			};
		}
		const status = this.index.getStatus();
		if (query?.fetchStatus === "fetching" && status.phase !== "building") {
			return { phase: "building", indexedMessageCount: 0 };
		}
		return status;
	}

	dispose(): Promise<void> {
		this.disposed = true;
		this.client.clear();
		// A cancelled query rejects immediately; its SQLite statements finish at the next yield.
		if (this.index.getStatus().phase !== "building") this.index.dispose();
		return this.buildCompletion;
	}

	private assertActive(accountId: string): void {
		if (this.disposed || accountId !== this.accountId) {
			throw new Error("Message search account is no longer loaded");
		}
	}
}
