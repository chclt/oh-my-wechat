import { Buffer } from "buffer";
import type { AccountType, UserType } from "@repo/types";
import { DataAdapter, DataAdapterResponse } from "@repo/types/adapter";
import * as Comlink from "comlink";
import CryptoJS from "crypto-js";
import * as ChatController from "./controllers/chat";
import * as ImageController from "./controllers/file/index.ts";
import * as MessageController from "./controllers/message";
import * as MessageAttachController from "./controllers/message-attach.ts";
import * as MessageImageController from "./controllers/message-image.ts";
import * as MessageSearchController from "./controllers/message-search.ts";
import * as MessageVideoController from "./controllers/message-video.ts";
import * as MessageVoiceController from "./controllers/message-voice.ts";
import * as RecordFileController from "./controllers/record-file.ts";
import * as RecordImageController from "./controllers/record-image.ts";
import * as RecordVideoController from "./controllers/record-video.ts";
import * as StatisticController from "./controllers/statistic";
import * as UserController from "./controllers/user.ts";
import {
	createWasmExecutor,
	type DatabaseExecutor,
	drizzleFromExecutor,
} from "./database/executor.ts";
import { MessageSearchIndex } from "./database/fts/message-search-index.ts";
import type { MessageSearchIndexStatus } from "./database/fts/message-search-index.ts";
import { sessionAbstractTable } from "./database/session.ts";
import type { WCDatabaseNames, WCDatabases } from "./types";
import {
	getFileFromDirectory,
	getFilesFromManifast,
	parseLocalInfo,
	parseUserFromMmsetting,
} from "./utils";
import { getSqlite3 } from "./utils/sqlite3.ts";
globalThis.Buffer = Buffer;

interface AdapterWorkerStore {
	directory: FileSystemDirectoryHandle | FileList | undefined;
	databases: WCDatabases;
	wcdbDicts: {
		1?: { url: string; data: Uint8Array };
		2?: { url: string; data: Uint8Array };
		3?: { url: string; data: Uint8Array };
		4?: { url: string; data: Uint8Array };
		5?: { url: string; data: Uint8Array };
	};
	accountList: AccountType[] | undefined;
	account: AccountType | undefined;
	messageSearchIndex: {
		instance: MessageSearchIndex | undefined;
		accountId: string | undefined;
		buildPromise: Promise<void> | undefined;
		messageDatabaseExecutors: DatabaseExecutor[] | undefined;
	};
}

export interface AdapterWorkerType extends Record<
	keyof Omit<DataAdapter, "init">,
	Function
> {
	_loadDirectory: (
		directory: FileSystemDirectoryHandle | FileList,
	) => Promise<void>;

	_loadAccountDatabase: (account: AccountType) => Promise<void>;

	_unloadAccountDatabase: () => void;

	_buildMessageSearchIndex: () => Promise<void>;

	_getStoreItem: <T extends keyof AdapterWorkerStore>(
		storeKey: T,
	) => NonNullable<AdapterWorkerStore[T]>;

	getAccountList: () => Promise<DataAdapterResponse<AccountType[]>>;

	getAccount: (input: {
		account: { id: string };
	}) => Promise<DataAdapterResponse<AccountType>>;

	getChatList: (input?: { userIds?: string[] }) => ChatController.AllOutput;

	getAccountContactList: () => UserController.ContactListOutput;

	getUserList: (input?: { userIds?: string[] }) => UserController.AllOutput;

	getMessageList: (
		controllerInput: MessageController.AllInput[0],
	) => MessageController.AllOutput;

	getGreetingMessageList: (
		controllerInput: MessageController.allVerifyInput[0],
	) => MessageController.allVerifyOutput;

	getMessageImage: (
		controllerInput: MessageImageController.GetInput[0],
	) => MessageImageController.GetOutput;

	resolveMessageFile: (
		controllerInput: ImageController.ResolveInput[0],
	) => Promise<DataAdapterResponse<{ src: string }>>;

	releaseMessageFile: (
		controllerInput: ImageController.ReleaseInput[0],
	) => Promise<DataAdapterResponse<void>>;

	getMessageVideo: (
		controllerInput: MessageVideoController.GetInput[0],
	) => MessageVideoController.GetOutput;

	getMessageVoice: (
		controllerInput: MessageVoiceController.GetInput[0],
	) => MessageVoiceController.GetOutput;

	getMessageAttach: (
		controllerInput: MessageAttachController.GetInput[0],
	) => MessageAttachController.GetOutput;

	getRecordImage: (
		controllerInput: RecordImageController.GetInput[0],
	) => RecordImageController.GetOutput;

	getRecordVideo: (
		controllerInput: RecordVideoController.GetInput[0],
	) => RecordVideoController.GetOutput;

	getRecordFile: (
		controllerInput: RecordFileController.GetInput[0],
	) => RecordFileController.GetOutput;

	getStatistic: (
		controllerInput: StatisticController.GetInput[0],
	) => StatisticController.GetOutput;

	searchMessages: (
		controllerInput: MessageSearchController.SearchMessagesInput[0],
	) => MessageSearchController.SearchMessagesOutput;

	getMessageSearchIndexStatus: () => MessageSearchController.GetMessageSearchIndexStatusOutput;
}

export const _store: Partial<AdapterWorkerStore> = {
	directory: undefined,
	databases: undefined,
	wcdbDicts: undefined,

	accountList: undefined,
	account: undefined,

	messageSearchIndex: {
		instance: undefined,
		accountId: undefined,
		buildPromise: undefined,
		messageDatabaseExecutors: undefined,
	},
};

export const adapterWorker: AdapterWorkerType = {
	_loadDirectory: async (directory) => {
		_store.directory = directory;
		_store.databases = {};
		_store.wcdbDicts = {};

		const storeDirectory = adapterWorker._getStoreItem("directory");

		const storeDatabase = adapterWorker._getStoreItem("databases");

		const sqlite3 = await getSqlite3();

		const manifestDatabaseFile = await getFileFromDirectory(
			storeDirectory,
			"Manifest.db",
		);
		if (!manifestDatabaseFile) throw new Error("Manifest.db not found");
		const manifestDatabaseFileBuffer = await manifestDatabaseFile.arrayBuffer();

		const manifestDatabase = drizzleFromExecutor(
			createWasmExecutor(new Uint8Array(manifestDatabaseFileBuffer), sqlite3),
		);

		storeDatabase.manifest = manifestDatabase;

		const localInfoBuffer = (
			await getFilesFromManifast(
				manifestDatabase,
				storeDirectory,
				"Documents/LocalInfo.data",
			)
		)[0].file;

		const loginedUserId = parseLocalInfo(
			new Uint8Array(await localInfoBuffer.arrayBuffer()),
		).id;

		const mmsettingFiles = await getFilesFromManifast(
			manifestDatabase,
			storeDirectory,
			"Documents/MMappedKV/mmsetting.archive.%",
		);

		const accounts: UserType[] = [];

		for (const row of mmsettingFiles) {
			if (/mmsetting\.archive\.[^.]+$/.test(row.filename)) {
				accounts.push(
					parseUserFromMmsetting(new Uint8Array(await row.file.arrayBuffer())),
				);
			}
		}

		_store.accountList = accounts.sort((a) =>
			a.id === loginedUserId ? -1 : 1,
		);
	},

	_loadAccountDatabase: async (account: UserType) => {
		const storeDirectory = adapterWorker._getStoreItem("directory");
		const storeDatabase = adapterWorker._getStoreItem("databases");
		const storeMessageSearchIndex =
			adapterWorker._getStoreItem("messageSearchIndex");

		if (!storeDatabase.manifest) {
			throw Error("IosBackupAdapter: Manifest.db is not loaded");
		}

		const accountIdMd5 = CryptoJS.MD5(account.id).toString();

		const sqlite3 = await getSqlite3();

		storeDatabase.message = undefined;
		storeMessageSearchIndex.messageDatabaseExecutors = undefined;

		let databaseFileBuffer: ArrayBuffer;

		databaseFileBuffer = await (
			await getFilesFromManifast(
				storeDatabase.manifest,
				storeDirectory,
				`Documents/${accountIdMd5}/session/session.db`,
			)
		)[0].file.arrayBuffer();
		storeDatabase.session = drizzleFromExecutor(
			createWasmExecutor(new Uint8Array(databaseFileBuffer), sqlite3),
		);

		databaseFileBuffer = await (
			await getFilesFromManifast(
				storeDatabase.manifest,
				storeDirectory,
				`Documents/${accountIdMd5}/DB/WCDB_Contact.sqlite`,
			)
		)[0].file.arrayBuffer();

		storeDatabase.WCDB_Contact = drizzleFromExecutor(
			createWasmExecutor(new Uint8Array(databaseFileBuffer), sqlite3),
		);

		for (const fileItem of await getFilesFromManifast(
			storeDatabase.manifest,
			storeDirectory,
			`Documents/${accountIdMd5}/DB/message_%.sqlite`,
		)) {
			const databaseFileBuffer = await fileItem.file.arrayBuffer();

			if (storeDatabase.message === undefined) storeDatabase.message = [];
			if (storeMessageSearchIndex.messageDatabaseExecutors === undefined) {
				storeMessageSearchIndex.messageDatabaseExecutors = [];
			}

			const messageExecutor = createWasmExecutor(
				new Uint8Array(databaseFileBuffer),
				sqlite3,
			);
			storeMessageSearchIndex.messageDatabaseExecutors.push(messageExecutor);
			storeDatabase.message.push(drizzleFromExecutor(messageExecutor));
		}

		_store.account = account;

		void adapterWorker._buildMessageSearchIndex();
	},

	_buildMessageSearchIndex: async () => {
		const sqlite3 = await getSqlite3();
		const databases = adapterWorker._getStoreItem("databases");
		const storeMessageSearchIndex =
			adapterWorker._getStoreItem("messageSearchIndex");

		const account = _store.account;
		if (!account) {
			return;
		}

		if (storeMessageSearchIndex.accountId === account.id) {
			const currentStatus = storeMessageSearchIndex.instance?.getStatus();
			if (currentStatus?.phase === "ready") {
				return;
			}

			if (storeMessageSearchIndex.buildPromise) {
				if (import.meta.env.DEV) {
					console.log("[索引构建] 复用：当前账号索引正在构建");
				}
				try {
					return await storeMessageSearchIndex.buildPromise;
				} finally {
				}
			}
		}

		const messageDatabases = databases.message;
		if (!messageDatabases || messageDatabases.length === 0) {
			return;
		}

		const messageSearchIndex = new MessageSearchIndex(sqlite3);
		storeMessageSearchIndex.instance = messageSearchIndex;
		storeMessageSearchIndex.accountId = account.id;

		const buildPromise = (async () => {
			// 收集所有已知会话标识（username），用于把 `Chat_<md5>` 表名还原成可读 username。
			let chatIdList: string[] = [];
			try {
				const sessionDatabase = databases.session;
				if (sessionDatabase) {
					const sessionRows = await sessionDatabase
						.select({ userName: sessionAbstractTable.UsrName })
						.from(sessionAbstractTable)
						.all();
					chatIdList = sessionRows.map((sessionRow) => sessionRow.userName);
				}
			} catch (error) {
				// 拿不到会话列表不影响索引构建，只是部分命中的 chatId 会为空。
				console.error(error);
			}

			await messageSearchIndex.build(messageDatabases, chatIdList);
		})();

		storeMessageSearchIndex.buildPromise = buildPromise;

		try {
			await buildPromise;
		} catch (error) {
			console.error("构建消息全文搜索索引失败", error);
		} finally {
			if (storeMessageSearchIndex.buildPromise === buildPromise) {
				storeMessageSearchIndex.buildPromise = undefined;
			}
		}
	},

	_unloadAccountDatabase: async () => {
		const storeDatabases = adapterWorker._getStoreItem("databases");

		for (const databaseName in storeDatabases) {
			const values = storeDatabases[databaseName as WCDatabaseNames];

			if (values === undefined) {
				continue;
			} else if (Array.isArray(values)) {
				for (const database of values) {
					// database.close();
				}
			} else {
				// values.close();
			}
		}

		_store.account = undefined;
	},

	_getStoreItem: (storeKey) => {
		if (_store[storeKey] === undefined) {
			throw Error(`IosBackupAdapter: _store.${storeKey} is not loaded`);
		}
		return _store[storeKey];
	},

	getAccountList: async () => {
		return { data: adapterWorker._getStoreItem("accountList") };
	},

	getAccount: async ({ account: targetAccount }) => {
		const account = adapterWorker
			._getStoreItem("accountList")
			?.find((account) => account.id === targetAccount.id);

		if (!account) {
			throw new Error("Account not found");
		}

		return { data: account };
	},

	async getChatList(input) {
		const { userIds } = input ?? {};

		if (userIds) {
			return await ChatController.find(
				{
					ids: userIds,
				},
				{
					account: this._getStoreItem("account"),
					databases: this._getStoreItem("databases"),
				},
			);
		}

		return await ChatController.all({
			account: this._getStoreItem("account"),
			databases: this._getStoreItem("databases"),
		});
	},

	getChat: async () => {
		throw Error("Not implemented");
	},

	getAccountContactList: async () => {
		return await UserController.contactList({
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getUserList: async (input) => {
		const { userIds } = input ?? {};

		if (userIds) {
			return await UserController.findAll(
				{ ids: userIds },
				{
					account: adapterWorker._getStoreItem("account"),
					databases: adapterWorker._getStoreItem("databases"),
				},
			);
		}

		return await UserController.all({
			account: adapterWorker._getStoreItem("account"),
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getUser: async () => {
		throw Error("Not implemented");
	},

	getMessageList: async (controllerInput) => {
		return await MessageController.all(controllerInput, {
			account: adapterWorker._getStoreItem("account"),
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	/*
	getAllMessageList: async (controllerInput) => {
		return await MessageController.allFromAll(controllerInput, {
			databases: adapterWorker._getStoreItem("databases"),
		});
	},
	*/

	getGreetingMessageList: async (controllerInput) => {
		return await MessageController.allVerify(controllerInput, {
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getMessageImage: async (controllerInput) => {
		return await MessageImageController.get(controllerInput, {
			directory: adapterWorker._getStoreItem("directory"),
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	resolveMessageFile: async (controllerInput) => {
		return await ImageController.resolve(controllerInput, {
			directory: adapterWorker._getStoreItem("directory"),
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	releaseMessageFile: async (controllerInput) => {
		return await ImageController.release(controllerInput, {
			directory: adapterWorker._getStoreItem("directory"),
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getMessageVideo: async (controllerInput) => {
		return await MessageVideoController.get(controllerInput, {
			directory: adapterWorker._getStoreItem("directory"),
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getMessageVoice: async (controllerInput) => {
		return await MessageVoiceController.get(controllerInput, {
			directory: adapterWorker._getStoreItem("directory"),
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getMessageAttach: async (controllerInput) => {
		return await MessageAttachController.get(controllerInput, {
			directory: adapterWorker._getStoreItem("directory"),
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getRecordImage: async (controllerInput) => {
		return await RecordImageController.get(controllerInput, {
			directory: adapterWorker._getStoreItem("directory"),
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getRecordVideo: async (controllerInput) => {
		return await RecordVideoController.get(controllerInput, {
			directory: adapterWorker._getStoreItem("directory"),
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getRecordFile: async (controllerInput) => {
		return await RecordFileController.get(controllerInput, {
			directory: adapterWorker._getStoreItem("directory"),
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getStatistic: async (controllerInput) => {
		return await StatisticController.get(controllerInput, {
			account: adapterWorker._getStoreItem("account"),
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	searchMessages: async (controllerInput) => {
		const messageSearchIndex =
			adapterWorker._getStoreItem("messageSearchIndex");
		const messageSearchIndexInstance = messageSearchIndex.instance;
		if (!messageSearchIndexInstance) {
			throw new Error("messageSearchIndexInstance Not Ready");
		}

		return await MessageSearchController.searchMessages(controllerInput, {
			messageSearchIndex: messageSearchIndexInstance,
		});
	},

	getMessageSearchIndexStatus: async () => {
		const messageSearchIndex =
			adapterWorker._getStoreItem("messageSearchIndex");
		const messageSearchIndexInstance = messageSearchIndex.instance;

		if (!messageSearchIndexInstance) {
			const idleStatus: MessageSearchIndexStatus = { phase: "idle" };
			return idleStatus;
		}
		return await MessageSearchController.getMessageSearchIndexStatus({
			messageSearchIndex: messageSearchIndexInstance,
		});
	},
};

Comlink.expose(adapterWorker);
