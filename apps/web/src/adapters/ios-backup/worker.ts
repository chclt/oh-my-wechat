import initSqlJs, { type Database } from "sql.js";
import sqliteUrl from "sql.js/dist/sql-wasm.wasm?url";
import CryptoJS from "crypto-js";
import type { AccountType, UserType } from "@/schema";
import {
	getFileFromDirectory,
	getFilesFromManifast,
	parseLocalInfo,
	parseUserFromMmsetting,
} from "./utils";
import { ChatController } from "./controllers/chat";
import { ContactController } from "./controllers/contact";
import { MessageController } from "./controllers/message";
import { ImageController } from "./controllers/image";
import { VideoController } from "./controllers/video";
import { VoiceController } from "./controllers/voice";
import { AttachController } from "./controllers/attach";
import { StatisticController } from "./controllers/statistic";
import * as Comlink from "comlink";
import type { DataAdapterResponse } from "../adapter";
import type { WCDatabaseNames, WCDatabases } from "./types";

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

export interface AdapterWorkerType {
	_loadDirectory: (
		directory: FileSystemDirectoryHandle | FileList,
	) => Promise<void>;

	_loadAccountDatabase: (account: AccountType) => Promise<void>;

	_unloadAccountDatabase: () => void;

	_getStoreItem: <T extends keyof AdapterWorkerStore>(
		storeKey: T,
	) => NonNullable<AdapterWorkerStore[T]>;

	getAccountList: () => Promise<DataAdapterResponse<AccountType[]>>;

	getAccount: (accountId: string) => Promise<DataAdapterResponse<AccountType>>;

	getChatList: (input?: { userIds?: string[] }) => ChatController.AllOutput;

	getContactList: (input?: {
		userIds?: string[];
	}) => ContactController.AllOutput;

	getMessageList: (
		controllerInput: MessageController.AllInput[0],
	) => MessageController.AllOutput;

	getAllMessageList: (
		controllerInput: MessageController.AllFromAllInput[0],
	) => MessageController.AllFromAllOutput;

	getVerifyMessageList: () => MessageController.allVerifyOutput;

	getImage: (
		controllerInput: ImageController.GetInput[0],
	) => ImageController.GetOutput;

	getVideo: (
		controllerInput: VideoController.GetInput[0],
	) => VideoController.GetOutput;

	getVoice: (
		controllerInput: VoiceController.GetInput[0],
	) => VoiceController.GetOutput;

	getAttach: (
		controllerInput: AttachController.GetInput[0],
	) => AttachController.GetOutput;

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
		const manifestDatabase = new SQL.Database(
			new Uint8Array(manifestDatabaseFileBuffer),
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
		storeDatabase.session = new SQL.Database(
			new Uint8Array(databaseFileBuffer),
		);

		databaseFileBuffer = await (
			await getFilesFromManifast(
				storeDatabase.manifest,
				storeDirectory,
				`Documents/${accountIdMd5}/DB/WCDB_Contact.sqlite`,
			)
		)[0].file.arrayBuffer();

		storeDatabase.WCDB_Contact = new SQL.Database(
			new Uint8Array(databaseFileBuffer),
		);

		for (const fileItem of await getFilesFromManifast(
			storeDatabase.manifest,
			storeDirectory,
			`Documents/${accountIdMd5}/DB/message_%.sqlite`,
		)) {
			const databaseFileBuffer = await fileItem.file.arrayBuffer();

			if (storeDatabase.message === undefined) storeDatabase.message = [];

			storeDatabase.message.push(
				new SQL.Database(new Uint8Array(databaseFileBuffer)),
			);
		}

		_store.account = account;
	},

	_unloadAccountDatabase: async () => {
		for (const databaseName in _store.databases) {
			if (Array.isArray(_store.databases[databaseName as WCDatabaseNames])) {
				for (const db of _store.databases[
					databaseName as WCDatabaseNames
				] as Database[]) {
					db.close();
				}
			} else {
				(_store.databases[databaseName as WCDatabaseNames] as Database).close();
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

	getAccount: async (accountId) => {
		const account = adapterWorker
			._getStoreItem("accountList")
			?.find((account) => account.id === accountId);

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

	getContactList: async (input) => {
		const { userIds } = input ?? {};

		if (userIds) {
			return await ContactController.findAll(
				{ ids: userIds },
				{ databases: adapterWorker._getStoreItem("databases") },
			);
		}

		return await ContactController.all({
			databases: adapterWorker._getStoreItem("databases"),
		});
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

	getVerifyMessageList: async () => {
		return await MessageController.allVerify({
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getImage: async (controllerInput) => {
		return await ImageController.get(controllerInput, {
			directory: adapterWorker._getStoreItem("directory"),
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getVideo: async (controllerInput) => {
		return await VideoController.get(controllerInput, {
			directory: adapterWorker._getStoreItem("directory"),
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getVoice: async (controllerInput) => {
		return await VoiceController.get(controllerInput, {
			directory: adapterWorker._getStoreItem("directory"),
			databases: adapterWorker._getStoreItem("databases"),
		});
	},

	getAttach: async (controllerInput) => {
		return await AttachController.get(controllerInput, {
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
