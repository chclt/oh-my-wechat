import { Buffer } from "buffer";
import type { AccountType, UserType } from "@repo/types";
import {
	DataAdapter,
	DataAdapterResponse,
	GetMessageSearchIndexStatusRequest,
	GetMessageSearchIndexStatusResponse,
} from "@repo/types/adapter";
import * as Comlink from "comlink";
import CryptoJS from "crypto-js";
import * as ChatController from "./controllers/chat";
import * as ChatSearchController from "./controllers/chat-search.ts";
import * as ImageController from "./controllers/file/index.ts";
import * as MessageController from "./controllers/message";
import * as MessageAttachController from "./controllers/message-attach.ts";
import * as MessageImageController from "./controllers/message-image.ts";
import type * as MessageSearchController from "./controllers/message-search.ts";
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
import { sessionAbstractTable } from "./database/session.ts";
import { MessageSearchSession } from "./message-search-session.ts";
import type { WCDatabases } from "./types";
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
	messageSearchIndex: MessageSearchSession | undefined;
	accountDatabaseExecutors: DatabaseExecutor[];
}

export interface AdapterWorkerType extends Record<
	keyof Omit<DataAdapter, "init">,
	Function
> {
	_loadDirectory: (
		directory: FileSystemDirectoryHandle | FileList,
	) => Promise<void>;

	_loadAccountDatabase: (account: AccountType) => Promise<void>;

	_unloadAccountDatabase: () => Promise<void>;

	_getStoreItem: <T extends keyof AdapterWorkerStore>(
		storeKey: T,
	) => NonNullable<AdapterWorkerStore[T]>;

	getAccountList: () => Promise<DataAdapterResponse<AccountType[]>>;

	getAccount: (input: {
		account: { id: string };
	}) => Promise<DataAdapterResponse<AccountType>>;

	getChatList: (input?: { userIds?: string[] }) => ChatController.AllOutput;

	searchChats: (
		controllerInput: ChatSearchController.SearchChatsInput[0],
	) => ChatSearchController.SearchChatsOutput;

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

	getMessageSearchIndexStatus: (
		input: GetMessageSearchIndexStatusRequest,
	) => GetMessageSearchIndexStatusResponse;
}

export const _store: Partial<AdapterWorkerStore> = {
	directory: undefined,
	databases: undefined,
	wcdbDicts: undefined,

	accountList: undefined,
	account: undefined,

	messageSearchIndex: undefined,
	accountDatabaseExecutors: [],
};

let accountLoad: AbortController | undefined;

export const adapterWorker: AdapterWorkerType = {
	_loadDirectory: async (directory) => {
		const previousCleanup = adapterWorker._unloadAccountDatabase();
		const load = new AbortController();
		accountLoad = load;
		await previousCleanup;
		load.signal.throwIfAborted();
		_store.accountList = undefined;
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
		load.signal.throwIfAborted();

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

		load.signal.throwIfAborted();
		_store.accountList = accounts.sort((a) =>
			a.id === loginedUserId ? -1 : 1,
		);
	},

	_loadAccountDatabase: async (account: UserType) => {
		const storeDirectory = adapterWorker._getStoreItem("directory");
		const storeDatabase = adapterWorker._getStoreItem("databases");

		if (!storeDatabase.manifest) {
			throw Error("IosBackupAdapter: Manifest.db is not loaded");
		}

		const previousCleanup = adapterWorker._unloadAccountDatabase();
		const load = new AbortController();
		accountLoad = load;
		const executors: DatabaseExecutor[] = [];
		try {
			await previousCleanup;
			load.signal.throwIfAborted();
			const sqlite3 = await getSqlite3();
			const manifest = storeDatabase.manifest;
			const accountIdMd5 = CryptoJS.MD5(account.id).toString();
			const openDatabase = async (file: File) => {
				const buffer = await file.arrayBuffer();
				load.signal.throwIfAborted();
				const executor = createWasmExecutor(new Uint8Array(buffer), sqlite3);
				executors.push(executor);
				return drizzleFromExecutor(executor);
			};
			const sessionFiles = await getFilesFromManifast(
				manifest,
				storeDirectory,
				`Documents/${accountIdMd5}/session/session.db`,
			);
			const session = await openDatabase(sessionFiles[0].file);
			const contactFiles = await getFilesFromManifast(
				manifest,
				storeDirectory,
				`Documents/${accountIdMd5}/DB/WCDB_Contact.sqlite`,
			);
			const WCDB_Contact = await openDatabase(contactFiles[0].file);
			const message: NonNullable<WCDatabases["message"]> = [];
			for (const fileItem of await getFilesFromManifast(
				manifest,
				storeDirectory,
				`Documents/${accountIdMd5}/DB/message_%.sqlite`,
			)) {
				message.push(await openDatabase(fileItem.file));
			}
			load.signal.throwIfAborted();

			// Publish one complete snapshot; an older load must never replace a newer account.
			const index = new MessageSearchIndex(sqlite3);
			const searchSession = new MessageSearchSession(
				account.id,
				index,
				async (signal) => {
					const sessionRows = await session
						.select({ userName: sessionAbstractTable.UsrName })
						.from(sessionAbstractTable)
						.all();
					signal.throwIfAborted();
					await index.build(
						message,
						sessionRows.map((row) => row.userName),
						{
							signal,
							debug: false,
						},
					);
				},
			);
			_store.databases = { manifest, session, WCDB_Contact, message };
			_store.account = account;
			_store.accountDatabaseExecutors = executors;
			_store.messageSearchIndex = searchSession;
			void searchSession.preload();
		} catch (error) {
			for (const executor of executors) executor.close();
			throw error;
		}
	},

	_unloadAccountDatabase: async () => {
		accountLoad?.abort();
		accountLoad = undefined;
		const searchSession = _store.messageSearchIndex;
		const executors = _store.accountDatabaseExecutors ?? [];
		_store.messageSearchIndex = undefined;
		_store.accountDatabaseExecutors = [];
		_store.account = undefined;
		_store.databases = { manifest: _store.databases?.manifest };
		await searchSession?.dispose();
		for (const executor of executors) executor.close();
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

	async searchChats(controllerInput) {
		return await ChatSearchController.searchChats(controllerInput, {
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
		return adapterWorker
			._getStoreItem("messageSearchIndex")
			.search(controllerInput);
	},

	getMessageSearchIndexStatus: async ({ account }) => {
		return (
			_store.messageSearchIndex?.getStatus(account.id) ?? { phase: "idle" }
		);
	},
};

Comlink.expose(adapterWorker);
