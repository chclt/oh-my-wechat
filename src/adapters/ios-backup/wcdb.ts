import type { Database } from "sql.js";
import { ZstdCodec } from "zstd-codec";

enum WCDBCompressionDictionaryName {
	NewBrandDict = 1,
	NewBrandExtDic = 2,
	BrandDict = 3,
	BrandExtDic = 4,
	MsgDict = 5,
}

const WCDBCompressionDictionaryPath = {
	[WCDBCompressionDictionaryName.NewBrandDict]:
		"/wcdb-compression-dicts/NewBrandDict.dict",
	[WCDBCompressionDictionaryName.NewBrandExtDic]:
		"/wcdb-compression-dicts/NewBrandExtDic.dict",
	[WCDBCompressionDictionaryName.BrandDict]:
		"/wcdb-compression-dicts/BrandDict.dict",
	[WCDBCompressionDictionaryName.BrandExtDic]:
		"/wcdb-compression-dicts/BrandExtDic.dict",
	[WCDBCompressionDictionaryName.MsgDict]:
		"/wcdb-compression-dicts/MsgDict.dict",
};

interface WCDBCompressionConfig {
	[DatabaseName: string]: null | {
		[TableName: string]: {
			[ColumnName: string]: WCDBCompressionDictionaryName;
		};
	};
}

const wcdbCompressionDictionary: Partial<
	Record<WCDBCompressionDictionaryName, Uint8Array>
> = {};

const wcdbCompressionConfig: WCDBCompressionConfig = {};

interface WCDBType {
	_loadCompressionDictionary: (
		dictionaryName: WCDBCompressionDictionaryName,
	) => Promise<void>;

	_getCompressionDictionary: (
		dictionaryName: WCDBCompressionDictionaryName,
	) => Promise<Uint8Array>;

	_parseDatabaseCompressionConfig: (databaseInfo: {
		databaseName: string;
		database: Database;
	}) => WCDBCompressionConfig[string];

	_getDatabaseCompressionConfig: (databaseInfo: {
		databaseName: string;
		database: Database;
	}) => WCDBCompressionConfig[string];

	execAsync: (
		sql: string,
		options: { databaseName: string; database: Database; tableName: string },
	) => Promise<any>;
}

const WCDB: WCDBType = {
	_loadCompressionDictionary: async (dictionaryName) => {
		if (wcdbCompressionDictionary[dictionaryName]) return;

		const dictionaryPath = WCDBCompressionDictionaryPath[dictionaryName];
		const dictionaryBuffer = await fetch(dictionaryPath).then((res) =>
			res.arrayBuffer(),
		);
		wcdbCompressionDictionary[dictionaryName] = new Uint8Array(
			dictionaryBuffer,
		);
	},

	_getCompressionDictionary: async (dictionaryName) => {
		if (wcdbCompressionDictionary[dictionaryName]) {
			return wcdbCompressionDictionary[dictionaryName];
		}
		await WCDB._loadCompressionDictionary(dictionaryName);

		if (wcdbCompressionDictionary[dictionaryName] === undefined) {
			throw new Error("WCDB Compression Dictionary not found");
		}
		return wcdbCompressionDictionary[dictionaryName];
	},

	_parseDatabaseCompressionConfig: ({ databaseName, database }) => {
		if (wcdbCompressionConfig[databaseName] !== undefined) {
			return wcdbCompressionConfig[databaseName];
		}

		const queryResult = database.exec(
			`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'wcdb_builtin_compression_record';`,
		);

		if (!queryResult[0] || queryResult[0].values.length === 0) {
			wcdbCompressionConfig[databaseName] = null;
			return wcdbCompressionConfig[databaseName];
		}

		const queryResult2 = database.exec(
			`SELECT * FROM wcdb_builtin_compression_record;`,
		);

		if (!queryResult2[0] || queryResult2[0].values.length === 0) {
			wcdbCompressionConfig[databaseName] = null;
			return wcdbCompressionConfig[databaseName];
		}

		let tableNameIndex: number | undefined;
		let columnNameIndex: number | undefined;
		let rowidIndex: number | undefined;

		queryResult2[0].columns.forEach((columnName, index) => {
			if (columnName === "tableName") {
				tableNameIndex = index;
			} else if (columnName === "columns") {
				columnNameIndex = index;
			} else if (columnName === "rowid") {
				rowidIndex = index;
			}
		});

		if (
			tableNameIndex === undefined ||
			columnNameIndex === undefined /* || rowidIndex === undefined */
		) {
			wcdbCompressionConfig[databaseName] = null;
			return wcdbCompressionConfig[databaseName];
		}

		queryResult2[0].values.forEach((row) => {
			const tableName = row[tableNameIndex as number] as string;
			const columnCompressionConfig = row[columnNameIndex as number] as string; // e.g. "Message:5", "content,msgSource:4,xml:3"

			const stringConfigArray = columnCompressionConfig.split(",");
			const settledColumnConfig: Record<string, WCDBCompressionDictionaryName> =
				{};
			const pendindColumnName: string[] = [];

			for (const stringConfig of stringConfigArray) {
				const [columnName, dictionaryId] = stringConfig.split(":");
				pendindColumnName.push(columnName);

				if (dictionaryId === undefined) {
				} else {
					for (const columnName of pendindColumnName) {
						settledColumnConfig[columnName] = Number(
							dictionaryId,
						) as WCDBCompressionDictionaryName;
					}
					pendindColumnName.length = 0;
				}
			}

			Object.entries(settledColumnConfig).forEach(
				([columnName, dictionaryId]) => {
					if (!wcdbCompressionConfig[databaseName]) {
						wcdbCompressionConfig[databaseName] = {};
					}
					if (!wcdbCompressionConfig[databaseName][tableName]) {
						wcdbCompressionConfig[databaseName][tableName] = {};
					}
					wcdbCompressionConfig[databaseName][tableName][columnName] =
						dictionaryId;
				},
			);
		});

		return wcdbCompressionConfig[databaseName];
	},

	_getDatabaseCompressionConfig: ({ databaseName, database }) => {
		if (wcdbCompressionConfig[databaseName] === undefined) {
			WCDB._parseDatabaseCompressionConfig({ databaseName, database });
		}

		return wcdbCompressionConfig[databaseName];
	},

	execAsync: async (sql, { databaseName, database, tableName }) => {
		const databaseCompressionConfig = WCDB._getDatabaseCompressionConfig({
			databaseName,
			database,
		});

		if (!databaseCompressionConfig) {
			return database.exec(sql);
		}

		const tableCompressionConfig = databaseCompressionConfig[tableName];
		if (!tableCompressionConfig) {
			return database.exec(sql);
		}

		const queryResult = database.exec(sql);

		return new Promise((resolve, reject) => {
			ZstdCodec.run(async (zstd: any) => {
				for (const segmentResult of queryResult) {
					const decompressedColumnIndex: Record<number, string> = {}; // 标记哪些列启用了压缩， columnIndex: columnName
					segmentResult.columns.forEach((columnName, index) => {
						const columnCompressionConfig = tableCompressionConfig[columnName];
						if (columnCompressionConfig) {
							decompressedColumnIndex[index] = columnName;
						}
					});

					for (const row of segmentResult.values) {
						for (const [columnIndexString, columnName] of Object.entries(
							decompressedColumnIndex,
						)) {
							const columnIndex = Number(columnIndexString);

							const rawColumnValue = row[columnIndex];

							if (rawColumnValue instanceof Uint8Array) {
								const zstdData = rawColumnValue;
								const zstdSimple = new zstd.Simple();
								const zstdDict = new zstd.Dict.Decompression(
									await WCDB._getCompressionDictionary(
										tableCompressionConfig[columnName],
									),
								);

								const decompressedData = zstdSimple.decompressUsingDict(
									zstdData,
									zstdDict,
								) as Uint8Array | null;

								if (decompressedData) {
									row[columnIndex] = new TextDecoder("utf-8").decode(
										decompressedData,
									);
								} else {
									row[columnIndex] = new TextDecoder("utf-8").decode(
										rawColumnValue,
									);
								}
							} else {
							}
						}
					}
				}

				resolve(queryResult);
			});
		});
	},
};

export default WCDB;
