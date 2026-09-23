import { MessageTypeEnum } from "@repo/types";
import CryptoJS from "crypto-js";
import { and, eq, sql } from "drizzle-orm";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import WCDB, {
	WCDBDatabaseSeriesName,
	WCDBTableSeriesName,
} from "../../utils/wcdb.ts";
import { getChatTable } from "../message.ts";
import type { MessageSearchPerformance } from "./message-search-performance.ts";

export interface MessageSearchDocument {
	messageLocalId: string;
	createTime: number;
	messagePlainText: string;
}

export function createMessageSearchTableMap(
	chatIds: string[],
): Map<string, string> {
	return new Map(
		chatIds.map((chatId) => [
			`Chat_${CryptoJS.MD5(chatId).toString()}`,
			chatId,
		]),
	);
}

export async function listMessageSearchTables(
	database: SqliteRemoteDatabase<Record<string, never>>,
): Promise<string[]> {
	const rows = await database
		.select({ name: sql<string>`name` })
		.from(sql`sqlite_master`)
		.where(
			and(eq(sql`type`, "table"), sql`name LIKE ${"Chat\\_%"} ESCAPE ${"\\"}`),
		);
	return rows.map((row) => row.name);
}

export async function readMessageSearchDocuments(
	database: SqliteRemoteDatabase<Record<string, never>>,
	tableName: string,
	profiler?: MessageSearchPerformance,
): Promise<{
	documents: MessageSearchDocument[];
	scannedRowCount: number;
}> {
	const table = getChatTable(tableName);
	profiler?.start("selectRows");
	const rows = await database
		.select({
			MesLocalID: sql<string>`CAST(${table.MesLocalID} AS TEXT)`.as(
				"MesLocalID",
			),
			CreateTime: table.CreateTime,
			Type: table.Type,
			Message: table.Message,
		})
		.from(table);
	profiler?.end("selectRows");

	const supportedRows = rows.filter((row) => {
		switch (row.Type) {
			case MessageTypeEnum.TEXT:
				return true;
			default:
				// TODO: Add XML and other message types when text extraction is supported.
				return false;
		}
	});
	profiler?.start("decompress");
	const { result, errors } = await WCDB.postProcess(supportedRows, {
		databaseSeries: WCDBDatabaseSeriesName.Message,
		tableSeries: WCDBTableSeriesName.Chat,
	});
	profiler?.end("decompress");
	const failedRowIndexes = new Set(errors.map((error) => error.rowIndex));
	const documents: MessageSearchDocument[] = [];

	for (const [rowIndex, row] of result.entries()) {
		// Failed post-processing can return a fallback string; it is not searchable text.
		if (failedRowIndexes.has(rowIndex) || typeof row.Message !== "string") {
			continue;
		}

		documents.push({
			messageLocalId: row.MesLocalID,
			createTime: row.CreateTime,
			messagePlainText: row.Message,
		});
	}

	return {
		documents,
		scannedRowCount: rows.length,
	};
}
