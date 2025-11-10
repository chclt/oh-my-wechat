import { zstdDecompressWithDict } from "./zstd";
import wcdbCompressionDictionaryUrlNewBrandDict from "../assets/wcdb-compression-dicts/NewBrandDict.dict?url";
import wcdbCompressionDictionaryUrlNewBrandExtDic from "../assets/wcdb-compression-dicts/NewBrandExtDict.dict?url";
import wcdbCompressionDictionaryUrlBrandDict from "../assets/wcdb-compression-dicts/BrandDict.dict?url";
import wcdbCompressionDictionaryUrlBrandExtDict from "../assets/wcdb-compression-dicts/BrandExtDict.dict?url";
import wcdbCompressionDictionaryUrlMsgDict from "../assets/wcdb-compression-dicts/MsgDict.dict?url";

/**
 * 实际发现从 wcdb_builtin_compression_record 表中获取的压缩配置大概率不完整
 * 所以为数据库、数据表配置固定的压缩列，判断字段值是否是二进制决定是不是需要解压
 */

enum WCDBCompressionDictionaryName {
	NewBrandDict = 1,
	NewBrandExtDic = 2,
	BrandDict = 3,
	BrandExtDic = 4,
	MsgDict = 5,
}

const WCDBCompressionDictionaryUrl = {
	[WCDBCompressionDictionaryName.NewBrandDict]:
		wcdbCompressionDictionaryUrlNewBrandDict,
	[WCDBCompressionDictionaryName.NewBrandExtDic]:
		wcdbCompressionDictionaryUrlNewBrandExtDic,
	[WCDBCompressionDictionaryName.BrandDict]:
		wcdbCompressionDictionaryUrlBrandDict,
	[WCDBCompressionDictionaryName.BrandExtDic]:
		wcdbCompressionDictionaryUrlBrandExtDict,
	[WCDBCompressionDictionaryName.MsgDict]: wcdbCompressionDictionaryUrlMsgDict,
};

const wcdbCompressionDictionary: Partial<
	Record<WCDBCompressionDictionaryName, Uint8Array>
> = {};

export enum WCDBDatabaseSeriesName {
	Message = "MessageDatabase",
}

export enum WCDBTableSeriesName {
	Chat = "ChatTable",
}

type WCDBCompressionConfigConstant = {
	[DatabaseSeries in WCDBDatabaseSeriesName]: {
		[TableSeries in WCDBTableSeriesName]: {
			[ColumnName: string]: WCDBCompressionDictionaryName;
		};
	};
};

const wcdbCompressionConfigConstant: WCDBCompressionConfigConstant = {
	[WCDBDatabaseSeriesName.Message]: {
		[WCDBTableSeriesName.Chat]: {
			Message: WCDBCompressionDictionaryName.MsgDict,
		},
	},
};

interface WCDBType {
	_loadCompressionDictionary: (
		dictionaryName: WCDBCompressionDictionaryName,
	) => Promise<void>;

	_getCompressionDictionary: (
		dictionaryName: WCDBCompressionDictionaryName,
	) => Promise<Uint8Array>;

	postProcess: <DataType extends Record<string, unknown>[]>(
		rows: DataType,
		options: {
			databaseSeries: WCDBDatabaseSeriesName;
			tableSeries: WCDBTableSeriesName;
		},
	) => Promise<DataType>;
}

const WCDB: WCDBType = {
	_loadCompressionDictionary: async (dictionaryName) => {
		if (wcdbCompressionDictionary[dictionaryName]) return;

		const dictionaryPath = WCDBCompressionDictionaryUrl[dictionaryName];
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

	postProcess: async (rows, { databaseSeries, tableSeries }) => {
		const databaseCompressionConfig =
			wcdbCompressionConfigConstant[databaseSeries];
		if (!databaseCompressionConfig) {
			return rows;
		}

		const tableCompressionConfig = databaseCompressionConfig[tableSeries];
		if (!tableCompressionConfig) {
			return rows;
		}

		for (const row of rows) {
			for (const [columnName, dictionaryName] of Object.entries(
				tableCompressionConfig,
			)) {
				if (!Object.prototype.hasOwnProperty.call(row, columnName)) {
					continue;
				}

				const rawColumnValue = row[columnName];

				if (rawColumnValue instanceof Uint8Array) {
					try {
						const compressedData = rawColumnValue;

						const dictData =
							await WCDB._getCompressionDictionary(dictionaryName);

						const decompressedData = (await zstdDecompressWithDict(
							compressedData,
							{ id: dictionaryName, data: dictData },
						)) as Uint8Array | null;

						if (decompressedData) {
							row[columnName] = new TextDecoder("utf-8").decode(
								decompressedData,
							);
						} else {
							row[columnName] = new TextDecoder("utf-8").decode(rawColumnValue);
						}
					} catch (error) {
						console.error(error);
						row[columnName] = new TextDecoder("utf-8").decode(rawColumnValue);
					}
				}
			}
		}

		return rows;
	},
};

export default WCDB;
