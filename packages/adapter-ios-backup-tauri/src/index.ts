import type { AccountType } from "@repo/types";
import type {
	DataAdapter,
	GetAccountContactListRequest,
	GetAccountRequest,
	GetChatRequest,
	GetChatListRequest,
	GetChatListResponse,
	GetMessageListRequest,
	GetMessageImageRequest,
	GetMessageImageResponse,
	GetMessageVideoRequest,
	GetMessageVideoResponse,
	GetMessageVoiceRequest,
	GetMessageVoiceResponse,
	GetMessageAttachRequest,
	GetMessageAttachResponse,
	ResolveMessageFileRequest,
	ResolveMessageFileResponse,
	ReleaseMessageFileRequest,
	GetMessageListResponse,
	GetUserRequest,
	GetUserListRequest,
	SearchChatsRequest,
	SearchChatsResponse,
} from "@repo/types/adapter";
import { convertFileSrc } from "@tauri-apps/api/core";
import { invoke } from "./invoke";
import { restoreChats } from "./restoreChats";
import { restoreMessages } from "./restoreMessages";

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
			data: restoreChats(response.data),
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

	async searchChats(input: SearchChatsRequest): SearchChatsResponse {
		const response = await invoke("search_chats", {
			accountId: input.account.id,
			query: input.query,
			offset: input.offset,
			limit: input.limit,
			// Use the same default language as JavaScript's toLocaleLowerCase().
			language: new Intl.Locale(Intl.DateTimeFormat().resolvedOptions().locale)
				.language,
		});
		return { ...response, data: restoreChats(response.data) };
	}

	async getMessageList(input: GetMessageListRequest): GetMessageListResponse {
		const response = await invoke("get_message_list", { request: input });
		return { ...response, data: restoreMessages(response.data) };
	}

	getGreetingMessageList: DataAdapter["getGreetingMessageList"] = async () => {
		throw new Error("Tauri adapter: getGreetingMessageList 尚未实现");
	};

	async getMessageImage(
		input: GetMessageImageRequest,
	): GetMessageImageResponse {
		const response = await invoke("get_message_image", { request: input });
		// The web adapter keeps own undefined dimensions when XML dimensions are absent.
		if (
			input.domain !== "opendata" &&
			input.message.message_entity.msg.img &&
			response.data
		) {
			for (const size of ["hd", "regular", "thumbnail"] as const) {
				const image = response.data[size];
				if (image)
					response.data[size] = {
						...image,
						width: image.width,
						height: image.height,
					};
			}
		}
		return response;
	}

	async resolveMessageFile(
		input: ResolveMessageFileRequest,
	): ResolveMessageFileResponse {
		const { data } = await invoke("resolve_message_file", { request: input });
		return { data: { src: convertFileSrc(data.src) } };
	}

	async releaseMessageFile(input: ReleaseMessageFileRequest) {
		await invoke("release_message_file", { request: input });
		return { data: undefined };
	}

	async getMessageVideo(
		input: GetMessageVideoRequest,
	): GetMessageVideoResponse {
		const { data } = await invoke("get_message_video", { request: input });
		if (data?.cover)
			data.cover = {
				...data.cover,
				width: data.cover.width,
				height: data.cover.height,
			};
		return { data: data ?? undefined };
	}

	async getMessageVoice(
		input: GetMessageVoiceRequest,
	): GetMessageVoiceResponse {
		const { data } = await invoke("get_message_voice", { request: input });
		if (data && "transcription" in data)
			data.transcription = data.transcription ?? undefined;
		return { data: data ?? undefined };
	}

	async getMessageAttach(
		input: GetMessageAttachRequest,
	): GetMessageAttachResponse {
		const { data } = await invoke("get_message_attach", { request: input });
		if (!data) return { data: undefined };
		// Attachments use the existing <a download> flow and component-owned URL
		// cleanup. A Blob URL also preserves its filename across WebView platforms.
		const response = await fetch(convertFileSrc(data.src));
		if (!response.ok)
			throw new Error(`Cannot read attachment: ${response.status}`);
		const blob = await response.blob();
		return {
			data: {
				src: URL.createObjectURL(
					input.type ? new Blob([blob], { type: input.type }) : blob,
				),
			},
		};
	}

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
