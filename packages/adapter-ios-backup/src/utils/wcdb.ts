export enum WCDBDatabaseSeriesName {
	Message = "MessageDatabase",
}

export enum WCDBTableSeriesName {
	Chat = "ChatTable",
}

type WCDBCompressionConfigConstant = {
	[DatabaseSeries in WCDBDatabaseSeriesName]: {
		[TableSeries in WCDBTableSeriesName]: {
			[ColumnName: string]: boolean;
		};
	};
};

const wcdbCompressionConfigConstant: WCDBCompressionConfigConstant = {
	[WCDBDatabaseSeriesName.Message]: {
		[WCDBTableSeriesName.Chat]: {
			Message: true,
		},
	},
};

interface WCDBType {
	postProcess: <DataType extends Record<string, unknown>[]>(
		rows: DataType,
		options: {
			databaseSeries: WCDBDatabaseSeriesName;
			tableSeries: WCDBTableSeriesName;
		},
	) => Promise<{ result: DataType; errors: { rowIndex: number }[] }>;
}

const WCDB: WCDBType = {
	postProcess: async (rows, { databaseSeries, tableSeries }) => {
		const errors: { rowIndex: number }[] = [];

		const databaseCompressionConfig =
			wcdbCompressionConfigConstant[databaseSeries];
		if (!databaseCompressionConfig) {
			return { result: rows, errors };
		}

		const tableCompressionConfig = databaseCompressionConfig[tableSeries];
		if (!tableCompressionConfig) {
			return { result: rows, errors };
		}

		for (let index = 0; index < rows.length; index++) {
			const row = rows[index];

			for (const [columnName, compressionFlag] of Object.entries(
				tableCompressionConfig,
			)) {
				if (!Object.prototype.hasOwnProperty.call(row, columnName)) {
					continue;
				}

				const rawColumnValue = row[columnName];

				if (rawColumnValue instanceof Uint8Array) {
					try {
						// TODO: 无法支持被压缩的消息
						throw new Error("Unsupported compressed column.");
					} catch (error) {
						row[columnName] = new TextDecoder("utf-8").decode(rawColumnValue);
						errors.push({
							rowIndex: index,
						});
					}
				}
			}
		}

		return { result: rows, errors };
	},
};

export default WCDB;
