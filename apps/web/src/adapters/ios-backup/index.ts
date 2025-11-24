import type { ChatType, UserType } from "@/schema";
import * as Comlink from "comlink";
import {
	DataAdapter,
	DataAdapterResponse,
	GetAccountContactListRequest,
	GetAttachRequest,
	GetChatListRequest,
	GetChatRequest,
	GetGreetingMessageListRequest,
	GetImageRequest,
	GetMessageListRequest,
	GetNoteMessageFileRequest,
	GetNoteMessageImageRequest,
	GetNoteMessageVideoRequest,
	GetStatisticRequest,
	GetUserListRequest,
	GetUserRequest,
	GetVideoRequest,
	GetVoiceRequest,
} from "../adapter.ts";
import type { AdapterWorkerType } from "./worker.ts";
import AdapterWorker from "./worker.ts?worker";

export default class IosBackupAdapter implements DataAdapter {
	private _directory: FileSystemDirectoryHandle | FileList | undefined;

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
		if (!this._directory) {
			throw new Error("Directory not loaded");
		}

		await this._workerAdapter._loadDirectory(this._directory);
	}

	async getAccountList() {
		return withCommonWrapper(
			() => this._workerAdapter.getAccountList(),
			"getAccountList",
		);
	}

	async getAccount(accountId: string) {
		return withCommonWrapper(
			() => this._workerAdapter.getAccount(accountId),
			"getAccount",
		);
	}

	async getUserList(input: GetUserListRequest) {
		return withCommonWrapper(
			() =>
				this._workerAdapter.getUserList(input) as Promise<
					DataAdapterResponse<UserType[]>
				>,
			"getUserList",
		);
	}

	async getUser(input: GetUserRequest) {
		return withCommonWrapper(async () => {
			const temp = (await this._workerAdapter.getUserList({
				userIds: [input.userId],
			})) as DataAdapterResponse<UserType[]>;

			const data = {
				data: temp.data[0],
			} satisfies DataAdapterResponse<UserType>;

			return data;
		}, "getUser");
	}

	async getAccountContactList(input: GetAccountContactListRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getAccountContactList(),
			"getAccountContactList",
		);
	}

	async getChatList(input: GetChatListRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getChatList(input),
			"getChatList",
		);
	}

	async getChat(input: GetChatRequest) {
		return withCommonWrapper(async () => {
			const temp = await this._workerAdapter.getChatList({
				userIds: [input.chatId],
			});

			const data = {
				data: temp.data[0],
			} satisfies DataAdapterResponse<ChatType>;

			return data;
		}, "getChat");
	}

	async getMessageList(input: GetMessageListRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getMessageList(input),
			"getMessageList",
		);
	}

	async getGreetingMessageList(input: GetGreetingMessageListRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getGreetingMessageList(input),
			"getGreetingMessageList",
		);
	}

	async getImage(input: GetImageRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getImage(input),
			"getImage",
		);
	}

	async getVideo(input: GetVideoRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getVideo(input),
			"getVideo",
		);
	}

	async getVoice(input: GetVoiceRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getVoice(input),
			"getVoice",
		);
	}

	async getAttach(input: GetAttachRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getAttach(input),
			"getAttach",
		);
	}

	async getNoteMessageImage(input: GetNoteMessageImageRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getNoteMessageImage(input),
			"getNoteMessageImage",
		);
	}

	async getNoteMessageVideo(input: GetNoteMessageVideoRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getNoteMessageVideo(input),
			"getNoteMessageVideo",
		);
	}

	async getNoteMessageFile(input: GetNoteMessageFileRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getNoteMessageFile(input),
			"getNoteMessageFile",
		);
	}

	async getStatistic(input: GetStatisticRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getStatistic(input),
			"getStatistic",
		);
	}
}

async function withCommonWrapper<T>(
	fn: () => Promise<T>,
	context: string,
): Promise<T> {
	return fn().catch((error) => {
		console.error(`[IosBackupAdapter Error] ${context}:`, error);
		throw error;
	});
}
