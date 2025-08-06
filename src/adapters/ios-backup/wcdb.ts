import { Database } from "sql.js";

interface WCDBCompressionConfig {
	[DatabaseName: string]: null | {
		[TableName: string]: {
			[ColumnName: string]: boolean;
		};
	};
}

const wcdbCompressionConfig: WCDBCompressionConfig = {};

interface WCDBType {
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

		let tableNameIndex: number | undefined = undefined;
		let columnNameIndex: number | undefined = undefined;
		let rowidIndex: number | undefined = undefined;

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
			const columnCompressionConfig = row[columnNameIndex as number] as string;

			const stringConfigArray = columnCompressionConfig.split(",");
			const settledColumnConfig: Record<string, boolean> = {};
			const pendindColumnName: string[] = [];

			for (const stringConfig of stringConfigArray) {
				const [columnName, dictionaryId] = stringConfig.split(":");
				pendindColumnName.push(columnName);

				if (dictionaryId === undefined) {
					continue;
				} else {
					for (const columnName of pendindColumnName) {
						settledColumnConfig[columnName] = true;
					}
					pendindColumnName.length = 0;
				}
			}

			Object.entries(settledColumnConfig).forEach(([columnName, enabled]) => {
				if (!wcdbCompressionConfig[databaseName]) {
					wcdbCompressionConfig[databaseName] = {};
				}
				if (!wcdbCompressionConfig[databaseName][tableName]) {
					wcdbCompressionConfig[databaseName][tableName] = {};
				}
				wcdbCompressionConfig[databaseName][tableName][columnName] = enabled;
			});
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

		return new Promise((resolve) => {
			for (const segmentResult of queryResult) {
				const decompressedColumnIndex: Record<number, string> = {};
				segmentResult.columns.forEach((columnName, index) => {
					const columnCompressionConfig = tableCompressionConfig[columnName];
					if (columnCompressionConfig) {
						decompressedColumnIndex[index] = columnName;
					}
				});

				for (const row of segmentResult.values) {
					for (const [columnIndexString] of Object.entries(
						decompressedColumnIndex,
					)) {
						const columnIndex = Number(columnIndexString);

						const rawColumnValue = row[columnIndex];

						if (rawColumnValue instanceof Uint8Array) {
							row[columnIndex] = new TextDecoder("utf-8").decode(
								rawColumnValue,
							);
						} else {
						}
					}
				}
			}

			resolve(queryResult);
		});
	},
};

export default WCDB;
