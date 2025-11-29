import type { ChatType, UserType } from "@/schema";
import * as Comlink from "comlink";
import {
	DataAdapter,
	DataAdapterResponse,
	GetAccountContactListRequest,
	GetAccountRequest,
	GetChatListRequest,
	GetChatRequest,
	GetGreetingMessageListRequest,
	GetMessageAttachRequest,
	GetMessageImageRequest,
	GetMessageListRequest,
	GetMessageVideoRequest,
	GetMessageVoiceRequest,
	GetRecordFileRequest,
	GetRecordImageRequest,
	GetRecordVideoRequest,
	GetStatisticRequest,
	GetUserListRequest,
	GetUserRequest,
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

	async getAccount(input: GetAccountRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getAccount(input),
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

	async getMessageImage(input: GetMessageImageRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getMessageImage(input),
			"getMessageImage",
		);
	}

	async getMessageVideo(input: GetMessageVideoRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getMessageVideo(input),
			"getMessageVideo",
		);
	}

	async getMessageVoice(input: GetMessageVoiceRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getMessageVoice(input),
			"getMessageVoice",
		);
	}

	async getMessageAttach(input: GetMessageAttachRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getMessageAttach(input),
			"getMessageAttach",
		);
	}

	// TODO: rename to getRecord...
	async getRecordImage(input: GetRecordImageRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getRecordImage(input),
			"getNoteMessageImage",
		);
	}

	async getRecordVideo(input: GetRecordVideoRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getRecordVideo(input),
			"getNoteMessageVideo",
		);
	}

	async getRecordFile(input: GetRecordFileRequest) {
		return withCommonWrapper(
			() => this._workerAdapter.getRecordFile(input),
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
