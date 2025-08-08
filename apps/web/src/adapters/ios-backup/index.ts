import * as Comlink from "comlink";
import AdapterWorker from "./worker.ts?worker";
import type { AdapterWorkerType } from "./worker.ts";
import type { ChatType, UserType } from "@/schema";
import type {
	DataAdapter,
	DataAdapterResponse,
	GetAttachRequest,
	GetChatListRequest,
	GetChatRequest,
	GetImageRequest,
	GetMessageListRequest,
	GetStatisticRequest,
	GetUserListRequest,
	GetUserRequest,
	GetVideoRequest,
	GetVoiceRequest,
} from "../adapter.ts";

export default class IosBackupAdapter implements DataAdapter {
	// @ts-ignore
	private _directory: FileSystemDirectoryHandle | FileList;

	private _workerAdapter: Comlink.Remote<AdapterWorkerType>;

	async _loadDirectory(directoryHandle: FileSystemDirectoryHandle | FileList) {
		this._directory = directoryHandle;
		await this._workerAdapter._loadDirectory(this._directory);
	}

	async _loadAccountDatabase(account: UserType) {
		await this._workerAdapter._loadAccountDatabase(account);
	}

	async _unloadAccountDatabase() {
		await this._workerAdapter._unloadAccountDatabase();
	}

	constructor() {
		this._workerAdapter = Comlink.wrap(new AdapterWorker());
	}

	async init() {
		await this._workerAdapter._loadDirectory(this._directory);
	}

	async getAccountList() {
		const data = await this._workerAdapter.getAccountList();

		if (import.meta.env.DEV) {
			console.groupCollapsed("getAccountList");
			console.log(data);
			console.groupEnd();
		}

		return data;
	}

	async getAccount(accountId: string) {
		const data = await this._workerAdapter.getAccount(accountId);

		if (import.meta.env.DEV) {
			console.groupCollapsed("getAccount");
			console.log(data);
			console.groupEnd();
		}

		return data;
	}

	async getUserList(input: GetUserListRequest) {
		const data = (await this._workerAdapter.getContactList(
			input,
		)) as DataAdapterResponse<UserType[]>;

		if (import.meta.env.DEV) {
			console.groupCollapsed("getUserList");
			console.log(data);
			console.groupEnd();
		}

		return data;
	}

	async getUser(input: GetUserRequest) {
		const temp = (await this._workerAdapter.getContactList({
			userIds: [input.userId],
		})) as DataAdapterResponse<UserType[]>;
		const data = { data: temp.data[0] } satisfies DataAdapterResponse<UserType>;

		if (import.meta.env.DEV) {
			console.groupCollapsed("getUser");
			console.log(data);
			console.groupEnd();
		}

		return data;
	}

	async getChatList(input: GetChatListRequest) {
		const data = await this._workerAdapter.getChatList(input);

		if (import.meta.env.DEV) {
			console.groupCollapsed("getChatList");
			console.log(data);
			console.groupEnd();
		}

		return data;
	}

	async getChat(input: GetChatRequest) {
		const temp = await this._workerAdapter.getChatList({
			userIds: [input.chatId],
		});
		const data = { data: temp.data[0] } satisfies DataAdapterResponse<ChatType>;

		if (import.meta.env.DEV) {
			console.groupCollapsed("getChatList");
			console.log(data);
			console.groupEnd();
		}

		return data;
	}

	async getMessageList(input: GetMessageListRequest) {
		const data = await this._workerAdapter.getMessageList(input);

		if (import.meta.env.DEV) {
			console.groupCollapsed("getMessageList");
			console.log(data);
			console.groupEnd();
		}

		return data;
	}

	async getImage(input: GetImageRequest) {
		const data = await this._workerAdapter.getImage(input);

		if (import.meta.env.DEV) {
			console.groupCollapsed("getImage");
			console.log(data);
			console.groupEnd();
		}

		return data;
	}

	async getVideo(input: GetVideoRequest) {
		const data = await this._workerAdapter.getVideo(input);

		if (import.meta.env.DEV) {
			console.groupCollapsed("getVideo");
			console.log(data);
			console.groupEnd();
		}

		return data;
	}

	async getVoice(input: GetVoiceRequest) {
		const data = await this._workerAdapter.getVoice(input);

		if (import.meta.env.DEV) {
			console.groupCollapsed("getVoice");
			console.log(data);
			console.groupEnd();
		}

		return data;
	}

	async getAttach(input: GetAttachRequest) {
		const data = await this._workerAdapter.getAttach(input);

		if (import.meta.env.DEV) {
			console.groupCollapsed("getAttach");
			console.log(data);
			console.groupEnd();
		}

		return data;
	}

	async getStatistic(input: GetStatisticRequest) {
		const data = await this._workerAdapter.getStatistic(input);

		if (import.meta.env.DEV) {
			console.groupCollapsed("getStatistic");
			console.log(data);
			console.groupEnd();
		}

		return data;
	}
}
