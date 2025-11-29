import type { AccountType, UserType } from "@/schema";
import * as Comlink from "comlink";
import CryptoJS from "crypto-js";
import { drizzle } from "drizzle-orm/sql-js";
import initSqlJs from "sql.js";
import sqliteUrl from "sql.js/dist/sql-wasm.wasm?url";
import type { DataAdapter, DataAdapterResponse } from "../adapter";
import * as ChatController from "./controllers/chat";
import * as MessageController from "./controllers/message";
import * as MessageAttachController from "./controllers/message-attach.ts";
import * as MessageImageController from "./controllers/message-image.ts";
import * as MessageVideoController from "./controllers/message-video.ts";
import * as MessageVoiceController from "./controllers/message-voice.ts";
import * as RecordFileController from "./controllers/record-file.ts";
import * as RecordImageController from "./controllers/record-image.ts";
import * as RecordVideoController from "./controllers/record-video.ts";
import * as StatisticController from "./controllers/statistic";
import * as UserController from "./controllers/user.ts";
import type { WCDatabaseNames, WCDatabases } from "./types";
import {
	getFileFromDirectory,
	getFilesFromManifast,
	parseLocalInfo,
	parseUserFromMmsetting,
} from "./utils";

import { Buffer } from "buffer";
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
}

export interface AdapterWorkerType
	extends Record<keyof Omit<DataAdapter, "init">, Function> {
	_loadDirectory: (
		directory: FileSystemDirectoryHandle | FileList,
	) => Promise<void>;

	_loadAccountDatabase: (account: AccountType) => Promise<void>;

	_unloadAccountDatabase: () => void;

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

	getAllMessageList: (
		controllerInput: MessageController.AllFromAllInput[0],
	) => MessageController.AllFromAllOutput;

	getGreetingMessageList: (
		controllerInput: MessageController.allVerifyInput[0],
	) => MessageController.allVerifyOutput;

	getMessageImage: (
		controllerInput: MessageImageController.GetInput[0],
	) => MessageImageController.GetOutput;

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
}

export const _store: Partial<AdapterWorkerStore> = {
	directory: undefined,
	databases: undefined,
	wcdbDicts: undefined,

	accountList: undefined,
	account: undefined,
};

export const adapterWorker: AdapterWorkerType = {
	_loadDirectory: async (directory) => {
		_store.directory = directory;
		_store.databases = {};
		_store.wcdbDicts = {};

		const storeDirectory = adapterWorker._getStoreItem("directory");

		const storeDatabase = adapterWorker._getStoreItem("databases");

		const SQL = await initSqlJs({ locateFile: () => sqliteUrl });

		const manifestDatabaseFile = await getFileFromDirectory(
			storeDirectory,
			"Manifest.db",
		);
		if (!manifestDatabaseFile) throw new Error("Manifest.db not found");
		const manifestDatabaseFileBuffer = await manifestDatabaseFile.arrayBuffer();

		const manifestDatabase = drizzle(
			new SQL.Database(new Uint8Array(manifestDatabaseFileBuffer)),
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

		if (!storeDatabase.manifest) {
			throw Error("IosBackupAdapter: Manifest.db is not loaded");
		}

		const accountIdMd5 = CryptoJS.MD5(account.id).toString();

		const SQL = await initSqlJs({ locateFile: () => sqliteUrl });

		let databaseFileBuffer: ArrayBuffer;

		databaseFileBuffer = await (
			await getFilesFromManifast(
				storeDatabase.manifest,
				storeDirectory,
				`Documents/${accountIdMd5}/session/session.db`,
			)
		)[0].file.arrayBuffer();
		storeDatabase.session = drizzle(
			new SQL.Database(new Uint8Array(databaseFileBuffer)),
		);

		databaseFileBuffer = await (
			await getFilesFromManifast(
				storeDatabase.manifest,
				storeDirectory,
				`Documents/${accountIdMd5}/DB/WCDB_Contact.sqlite`,
			)
		)[0].file.arrayBuffer();

		storeDatabase.WCDB_Contact = drizzle(
			new SQL.Database(new Uint8Array(databaseFileBuffer)),
		);

		for (const fileItem of await getFilesFromManifast(
			storeDatabase.manifest,
			storeDirectory,
			`Documents/${accountIdMd5}/DB/message_%.sqlite`,
		)) {
			const databaseFileBuffer = await fileItem.file.arrayBuffer();

			if (storeDatabase.message === undefined) storeDatabase.message = [];

			storeDatabase.message.push(
				drizzle(new SQL.Database(new Uint8Array(databaseFileBuffer))),
			);
		}

		_store.account = account;
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
					databases: this._getStoreItem("databases"),
				},
			);
		}

		return await ChatController.all({
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
				{ databases: adapterWorker._getStoreItem("databases") },
			);
		}

		return await UserController.all({
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getUser: async () => {
		throw Error("Not implemented");
	},

	getMessageList: async (controllerInput) => {
		return await MessageController.all(controllerInput, {
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getAllMessageList: async (controllerInput) => {
		return await MessageController.allFromAll(controllerInput, {
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

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
			databases: adapterWorker._getStoreItem("databases"),
		});
	},
};

Comlink.expose(adapterWorker);
