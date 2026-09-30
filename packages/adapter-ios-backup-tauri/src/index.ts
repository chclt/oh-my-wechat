import type { AccountType } from "@repo/types";
import type { DataAdapter, GetAccountRequest } from "@repo/types/adapter";
import { invoke } from "./invoke";

export default class IosBackupTauriAdapter implements DataAdapter {
	private _directory: string | undefined;
	private _directoryLoaded = false;

	async _loadDirectory(directory: string, password?: string): Promise<void> {
		this._directoryLoaded = false;
		this._directory = directory;
		await invoke("load_backup_directory", { directory, password });
		this._directoryLoaded = true;
	}

	async _loadAccountDatabase(account: Pick<AccountType, "id">) {
		await invoke("load_account_database", {
			accountId: account.id,
		});
	}

	async _unloadAccountDatabase() {
		await invoke("unload_account_database");
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

	getChatList: DataAdapter["getChatList"] = async () => {
		throw new Error("Tauri adapter: getChatList 尚未实现");
	};

	getChat: DataAdapter["getChat"] = async () => {
		throw new Error("Tauri adapter: getChat 尚未实现");
	};

	getUser: DataAdapter["getUser"] = async () => {
		throw new Error("Tauri adapter: getUser 尚未实现");
	};

	getUserList: DataAdapter["getUserList"] = async () => {
		throw new Error("Tauri adapter: getUserList 尚未实现");
	};

	getAccountContactList: DataAdapter["getAccountContactList"] = async () => {
		throw new Error("Tauri adapter: getAccountContactList 尚未实现");
	};

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
