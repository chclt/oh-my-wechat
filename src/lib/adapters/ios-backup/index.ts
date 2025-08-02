import initSqlJs, { type Database } from "sql.js";
import sqliteUrl from "sql.js/dist/sql-wasm.wasm?url";
import CryptoJS from "crypto-js";
import * as Comlink from "comlink";
import AdapterWorker from "./worker.ts?worker";
import type { AdapterWorkerType } from "./worker.ts";
import type { Chat, User, WCDatabaseNames, WCDatabases } from "@/lib/schema";
import { MessageController } from "./controllers/message";

import type { DataAdapterClassType } from "../adapter.ts";

interface IosBackupAdapterOptions {
  directory: FileSystemDirectoryHandle | FileList;
}

export default class IosBackupAdapter implements DataAdapterClassType {
  private _directory: FileSystemDirectoryHandle | FileList;

  private _workerAdapter: Comlink.Remote<AdapterWorkerType>;

  async _loadDirectory() {
    await this._workerAdapter.loadDirectory(this._directory);
  }

  async _loadDatabases(account: User) {
    await this._workerAdapter.loadAccount(account);
  }

  async _unloadDatabases() {
    await this._workerAdapter.unloadDatabases();
  }

  constructor(options: IosBackupAdapterOptions) {
    this._directory = options.directory;

    this._workerAdapter = Comlink.wrap(new AdapterWorker());
  }

  async init() {
    await this._workerAdapter.loadDirectory(this._directory);
  }

  async getAccountList() {
    return await this._workerAdapter.getAccountList();
  }

  async getChatList(input?: { userIds?: string[] }) {
    return await this._workerAdapter.getChatList(input);
  }

  async getMessageList(input: MessageController.AllInput[0]) {
    return await this._workerAdapter.getMessageList(input);
  }
}
