import * as Comlink from "comlink";
import AdapterWorker from "./worker.ts?worker";
import type { AdapterWorkerType } from "./worker.ts";
import type { UserType } from "@/lib/schema";
import type { MessageController } from "./controllers/message";

import type { DataAdapter } from "../adapter.ts";
import type { ImageController } from "./controllers/image.ts";
import type { VideoController } from "./controllers/video.ts";
import type { VoiceController } from "./controllers/voice.ts";
import type { AttachController } from "./controllers/attach.ts";
import type { StatisticController } from "./controllers/statistic.ts";

export default class IosBackupAdapter implements DataAdapter {
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

		console.groupCollapsed("getAccountList");
		console.log(data);
		console.groupEnd();
		return data;
	}

	async getAccount(accountId: string) {
		const data = await this._workerAdapter.getAccount(accountId);

		console.groupCollapsed("getAccount");
		console.log(data);
		console.groupEnd();
		return data;
	}

	async getChatList(input?: { userIds?: string[] }) {
		const data = await this._workerAdapter.getChatList(input);

		console.groupCollapsed("getChatList");
		console.log(data);
		console.groupEnd();
		return data;
	}

	async getMessageList(input: MessageController.AllInput[0]) {
		const data = await this._workerAdapter.getMessageList(input);

		console.groupCollapsed("getMessageList");
		console.log(data);
		console.groupEnd();
		return data;
	}

	async getImage(input: ImageController.GetInput[0]) {
		const data = await this._workerAdapter.getImage(input);

		console.groupCollapsed("getImage");
		console.log(data);
		console.groupEnd();
		return data;
	}

	async getVideo(input: VideoController.GetInput[0]) {
		const data = await this._workerAdapter.getVideo(input);

		console.groupCollapsed("getVideo");
		console.log(data);
		console.groupEnd();
		return data;
	}

	async getVoice(input: VoiceController.GetInput[0]) {
		const data = await this._workerAdapter.getVoice(input);

		console.groupCollapsed("getVoice");
		console.log(data);
		console.groupEnd();
		return data;
	}

	async getAttache(input: AttachController.GetInput[0]) {
		const data = await this._workerAdapter.getAttache(input);

		console.groupCollapsed("getAttache");
		console.log(data);
		console.groupEnd();
		return data;
	}

	async getStatistic(input: StatisticController.GetInput[0]) {
		const data = await this._workerAdapter.getStatistic(input);

		console.groupCollapsed("getStatistic");
		console.log(data);
		console.groupEnd();
		return data;
	}
}
