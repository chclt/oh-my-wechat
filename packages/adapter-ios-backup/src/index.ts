import type { AccountType, ChatType, UserType } from "@repo/types";
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
	GetRecordAudioRequest,
	GetRecordImageRequest,
	GetRecordVideoRequest,
	GetMessageSearchIndexStatusRequest,
	GetMessageSearchIndexStatusResponse,
	GetStatisticRequest,
	GetUserListRequest,
	GetUserRequest,
	ReleaseMessageFileRequest,
	ResolveMessageFileRequest,
	SearchChatsRequest,
	SearchMessagesRequest,
} from "@repo/types/adapter";
import * as Comlink from "comlink";
import type { AdapterWorkerType } from "./worker.ts";
import AdapterWorker from "./worker.ts?worker";

export default class IosBackupAdapter implements DataAdapter {
	private _directory: FileSystemDirectoryHandle | FileList | undefined;
	private _directoryLoaded = false;

	private _worker: Worker | undefined;
	private _proxy: Comlink.Remote<AdapterWorkerType> | undefined;
	private _generation = 0;
	private _lifetime: AbortController | undefined;

	private async call<T>(
		fn: (worker: Comlink.Remote<AdapterWorkerType>) => Promise<T>,
		context: string,
	): Promise<T> {
		// Capture the worker and its lifetime together; reopening must not adopt old calls.
		const proxy = this._proxy;
		const lifetime = this._lifetime;
		if (!proxy || !lifetime) throw new Error("Directory not loaded");
		try {
			return await withAbort(fn(proxy), lifetime.signal);
		} catch (error) {
			if (!lifetime.signal.aborted)
				console.error(`[IosBackupAdapter Error] ${context}:`, error);
			throw error;
		}
	}

	async _loadDirectory(
		directoryHandle: FileSystemDirectoryHandle | FileList,
		password?: string,
	) {
		const cleanup = this._unloadDirectory();
		const generation = this._generation;
		await cleanup;
		if (generation !== this._generation)
			throw new DOMException("Backup loading was cancelled", "AbortError");
		const worker = new AdapterWorker();
		const proxy = Comlink.wrap<AdapterWorkerType>(worker);
		this._worker = worker;
		this._proxy = proxy;
		const lifetime = new AbortController();
		this._lifetime = lifetime;
		try {
			await withAbort(
				proxy._loadDirectory(directoryHandle, password),
				lifetime.signal,
			);
			if (generation !== this._generation)
				throw new DOMException("Backup loading was cancelled", "AbortError");
			this._directory = directoryHandle;
			this._directoryLoaded = true;
		} catch (error) {
			if (this._proxy === proxy)
				await this._unloadDirectory().catch(console.error);
			throw error;
		}
	}

	async _loadAccountDatabase(account: AccountType) {
		await this.call(
			(worker) => worker._loadAccountDatabase(account),
			"_loadAccountDatabase",
		);
	}

	async _unloadAccountDatabase() {
		if (!this._proxy) return;
		await this.call(
			(worker) => worker._unloadAccountDatabase(),
			"_unloadAccountDatabase",
		);
	}

	async _unloadDirectory() {
		++this._generation;
		this._lifetime?.abort();
		this._lifetime = undefined;
		const worker = this._worker;
		const proxy = this._proxy;
		this._worker = undefined;
		this._proxy = undefined;
		this._directory = undefined;
		this._directoryLoaded = false;
		try {
			await proxy?._unloadDirectory();
		} finally {
			try {
				proxy?.[Comlink.releaseProxy]();
			} finally {
				worker?.terminate();
			}
		}
	}

	async init() {
		if (!this._directory) {
			throw new Error("Directory not loaded");
		}

		if (!this._directoryLoaded) await this._loadDirectory(this._directory);
	}

	async getAccountList() {
		return this.call((worker) => worker.getAccountList(), "getAccountList");
	}

	async getAccount(input: GetAccountRequest) {
		return this.call((worker) => worker.getAccount(input), "getAccount");
	}

	async getUserList(input: GetUserListRequest) {
		return this.call(
			(worker) =>
				worker.getUserList(input) as Promise<DataAdapterResponse<UserType[]>>,
			"getUserList",
		);
	}

	async getUser(input: GetUserRequest) {
		return this.call(async (worker) => {
			const temp = (await worker.getUserList({
				userIds: [input.user.id],
			})) as DataAdapterResponse<UserType[]>;

			const data = {
				data: temp.data[0],
			} satisfies DataAdapterResponse<UserType>;

			return data;
		}, "getUser");
	}

	async getAccountContactList(input: GetAccountContactListRequest) {
		return this.call(
			(worker) => worker.getAccountContactList(),
			"getAccountContactList",
		);
	}

	async getChatList(input: GetChatListRequest) {
		return this.call((worker) => worker.getChatList(input), "getChatList");
	}

	async searchChats(input: SearchChatsRequest) {
		return this.call((worker) => worker.searchChats(input), "searchChats");
	}

	async getChat(input: GetChatRequest) {
		return this.call(async (worker) => {
			const temp = await worker.getChatList({
				userIds: [input.chat.id],
			});

			const data = {
				data: temp.data[0],
			} satisfies DataAdapterResponse<ChatType>;

			return data;
		}, "getChat");
	}

	async getMessageList(input: GetMessageListRequest) {
		return this.call(
			(worker) => worker.getMessageList(input),
			"getMessageList",
		);
	}

	async getGreetingMessageList(input: GetGreetingMessageListRequest) {
		return this.call(
			(worker) => worker.getGreetingMessageList(input),
			"getGreetingMessageList",
		);
	}

	async getMessageImage(input: GetMessageImageRequest) {
		return this.call(
			(worker) => worker.getMessageImage(input),
			"getMessageImage",
		);
	}

	async resolveMessageFile(input: ResolveMessageFileRequest) {
		return this.call(
			(worker) => worker.resolveMessageFile(input),
			"resolveMessageFile",
		);
	}

	async releaseMessageFile(input: ReleaseMessageFileRequest) {
		if (!this._proxy) return { data: undefined };
		return this.call(
			(worker) => worker.releaseMessageFile(input),
			"releaseMessageFile",
		);
	}

	async getMessageVideo(input: GetMessageVideoRequest) {
		return this.call(
			(worker) => worker.getMessageVideo(input),
			"getMessageVideo",
		);
	}

	async getMessageVoice(input: GetMessageVoiceRequest) {
		return this.call(
			(worker) => worker.getMessageVoice(input),
			"getMessageVoice",
		);
	}

	async getMessageAttach(input: GetMessageAttachRequest) {
		return this.call(
			(worker) => worker.getMessageAttach(input),
			"getMessageAttach",
		);
	}

	async getRecordImage(input: GetRecordImageRequest) {
		return this.call(
			(worker) => worker.getRecordImage(input),
			"getRecordImage",
		);
	}

	async getRecordVideo(input: GetRecordVideoRequest) {
		return this.call(
			(worker) => worker.getRecordVideo(input),
			"getRecordVideo",
		);
	}

	async getRecordFile(input: GetRecordFileRequest) {
		return this.call((worker) => worker.getRecordFile(input), "getRecordFile");
	}

	async getRecordAudio(input: GetRecordAudioRequest) {
		return this.call(
			(worker) => worker.getRecordAudio(input),
			"getRecordAudio",
		);
	}

	async getStatistic(input: GetStatisticRequest) {
		return this.call((worker) => worker.getStatistic(input), "getStatistic");
	}

	async searchMessages(input: SearchMessagesRequest) {
		return this.call(
			(worker) => worker.searchMessages(input),
			"searchMessages",
		);
	}

	async getMessageSearchIndexStatus(
		input: GetMessageSearchIndexStatusRequest,
	): GetMessageSearchIndexStatusResponse {
		return this.call<Awaited<GetMessageSearchIndexStatusResponse>>(
			(worker) => worker.getMessageSearchIndexStatus(input),
			"getMessageSearchIndexStatus",
		);
	}
}

// Terminating a Worker does not reject its outstanding Comlink calls by itself.
function withAbort<T>(task: Promise<T>, signal: AbortSignal): Promise<T> {
	return new Promise((resolve, reject) => {
		const abort = () => reject(signal.reason);
		if (signal.aborted) abort();
		else signal.addEventListener("abort", abort, { once: true });
		void task
			.then(resolve, reject)
			.finally(() => signal.removeEventListener("abort", abort));
	});
}
