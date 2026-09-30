import type { AccountType } from "@repo/types";
import type {
	DataAdapter,
	GetAccountContactListRequest,
	GetAccountRequest,
	GetChatRequest,
	GetChatListRequest,
	GetChatListResponse,
	GetUserRequest,
	GetUserListRequest,
} from "@repo/types/adapter";
import { invoke } from "./invoke";

export default class IosBackupTauriAdapter implements DataAdapter {
	private _directory: string | undefined;
	private _directoryLoaded = false;
	private _accountId: string | undefined;

	async _loadDirectory(directory: string, password?: string): Promise<void> {
		this._directoryLoaded = false;
		this._directory = directory;
		this._accountId = undefined;
		await invoke("load_backup_directory", { directory, password });
		this._directoryLoaded = true;
	}

	async _loadAccountDatabase(account: Pick<AccountType, "id">) {
		this._accountId = undefined;
		await invoke("load_account_database", {
			accountId: account.id,
		});
		this._accountId = account.id;
	}

	async _unloadAccountDatabase() {
		await invoke("unload_account_database");
		this._accountId = undefined;
	}

	async init() {
		if (!this._directory) throw new Error("Directory not loaded");
		if (!this._directoryLoaded) await this._loadDirectory(this._directory);
	}

	getAccountList() {
		return invoke("get_account_list");
	}

	getAccount(input: GetAccountRequest) {
		return invoke("get_account", {
			accountId: input.account.id,
		});
	}

	async getChatList(input: GetChatListRequest): GetChatListResponse {
		const response = await invoke("get_chat_list", {
			accountId: this.getAccountId(),
			userIds: input.userIds,
		});
		return {
			data: response.data.map((chat) => ({
				...chat,
				title: chat.title,
				is_pinned: chat.is_pinned,
				...(chat.type === "private"
					? {
							user: chat.user,
							// The web adapter can return undefined for missing contacts.
							// IPC encodes those array slots as null; restore them here.
							members: chat.members.map((member) => member ?? undefined),
						}
					: { chatroom: chat.chatroom }),
			})),
		};
	}

	async getChat(input: GetChatRequest) {
		const response = await this.getChatList({
			userIds: [input.chat.id],
		});
		// Match the web adapter: an absent chat remains undefined at runtime.
		return { data: response.data[0]! };
	}

	private getAccountId() {
		if (!this._accountId) throw new Error("Account database is not loaded");
		return this._accountId;
	}

	async getUser(input: GetUserRequest) {
		const response = await this.getUserList({
			userIds: [input.user.id],
		});
		// Match the web adapter: an absent user remains undefined at runtime.
		return { data: response.data[0]! };
	}

	async getUserList(input: GetUserListRequest) {
		return invoke("get_user_list", {
			accountId: this.getAccountId(),
			userIds: input.userIds,
		});
	}

	getAccountContactList(input: GetAccountContactListRequest) {
		return invoke("get_account_contact_list", {
			accountId: input.account.id,
		});
	}

	searchChats: DataAdapter["searchChats"] = async () => {
		throw new Error("Tauri adapter: searchChats 尚未实现");
	};

	getMessageList: DataAdapter["getMessageList"] = async () => {
		throw new Error("Tauri adapter: getMessageList 尚未实现");
	};

	getGreetingMessageList: DataAdapter["getGreetingMessageList"] = async () => {
		throw new Error("Tauri adapter: getGreetingMessageList 尚未实现");
	};

	getMessageImage: DataAdapter["getMessageImage"] = async () => {
		throw new Error("Tauri adapter: getMessageImage 尚未实现");
	};

	resolveMessageFile: DataAdapter["resolveMessageFile"] = async () => {
		throw new Error("Tauri adapter: resolveMessageFile 尚未实现");
	};

	releaseMessageFile: DataAdapter["releaseMessageFile"] = async () => {
		throw new Error("Tauri adapter: releaseMessageFile 尚未实现");
	};

	getMessageVideo: DataAdapter["getMessageVideo"] = async () => {
		throw new Error("Tauri adapter: getMessageVideo 尚未实现");
	};

	getMessageVoice: DataAdapter["getMessageVoice"] = async () => {
		throw new Error("Tauri adapter: getMessageVoice 尚未实现");
	};

	getMessageAttach: DataAdapter["getMessageAttach"] = async () => {
		throw new Error("Tauri adapter: getMessageAttach 尚未实现");
	};

	getRecordImage: DataAdapter["getRecordImage"] = async () => {
		throw new Error("Tauri adapter: getRecordImage 尚未实现");
	};

	getRecordVideo: DataAdapter["getRecordVideo"] = async () => {
		throw new Error("Tauri adapter: getRecordVideo 尚未实现");
	};

	getRecordFile: DataAdapter["getRecordFile"] = async () => {
		throw new Error("Tauri adapter: getRecordFile 尚未实现");
	};

	getRecordAudio: DataAdapter["getRecordAudio"] = async () => {
		throw new Error("Tauri adapter: getRecordAudio 尚未实现");
	};

	getStatistic: DataAdapter["getStatistic"] = async () => {
		throw new Error("Tauri adapter: getStatistic 尚未实现");
	};

	searchMessages: DataAdapter["searchMessages"] = async () => {
		throw new Error("Tauri adapter: searchMessages 尚未实现");
	};

	getMessageSearchIndexStatus: DataAdapter["getMessageSearchIndexStatus"] =
		async () => {
			throw new Error("Tauri adapter: getMessageSearchIndexStatus 尚未实现");
		};
}
