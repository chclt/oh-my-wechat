import { AttachController } from "@/lib/controllers/attach.ts";
import { ChatController } from "@/lib/controllers/chat.ts";
import { ContactController } from "@/lib/controllers/contact.ts";
import { ImageController } from "@/lib/controllers/image.ts";
import { MessageController } from "@/lib/controllers/message.ts";
import { StatisticController } from "@/lib/controllers/statistic.ts";
import { VideoController } from "@/lib/controllers/video.ts";
import { VoiceController } from "@/lib/controllers/voice.ts";
import _global from "@/lib/global.ts";
import type { User, WCDatabaseNames, WCDatabases } from "@/lib/schema.ts";
import {
  getFileFromDirectory,
  getFilesFromManifast,
  parseLocalInfo,
  parseUserFromMmsetting,
} from "@/lib/utils.ts";
import CryptoJS from "crypto-js";
import initSqlJs, { type Database } from "sql.js";
import sqliteUrl from "sql.js/dist/sql-wasm.wasm?url";
import { Wrapped2024Controller } from "./controllers/wrapped-2024";

export interface WorkerRequest<Type = unknown, Payload = unknown> {
  id: string;
  type: Type;
  payload: Payload;
}

export interface WorkerResponse<T extends object = object> {
  id: string;
  payload: {
    success: boolean;
    data?: unknown;
    error?: unknown;
  } & T;
}

export type WorkerRequestLoadDatabases = WorkerRequest<
  "load_databases",
  {
    account: User;
  }
>;

export type WorkerResponseLoadDatabases = WorkerResponse<{
  data: {
    databases: WCDatabases;
    account: User;
  };
}>;

export type WorkerRequestQuery = WorkerRequest<"query", [string, ...unknown[]]>;

type WorkerResponseQuery = WorkerResponse<{ data: unknown }>;

enum Controller {
  Chats = "/chats",
  ChatsIn = "/chats/in",
  Contacts = "/contacts",
  ContactsIn = "/contacts/in",
  MessagesAll = "/messages/all",
  Messages = "/messages",
  MessagesVerify = "/messages/verify",
  Images = "/images",
  Videos = "/videos",
  Voices = "/voices",
  Attaches = "/attaches",
  Statistic = "/statistics/chat",
  Wrapped2024 = "/wrapped/2024",
  Wrapped2024_RandomMediaMessage = "/wrapped/messages/media/random",
}

const controller: {
  [key: string]: (...args: any[]) => Promise<unknown>;
} = {
  [Controller.Chats]: ChatController.all,
  [Controller.ChatsIn]: ChatController.in,
  [Controller.Contacts]: ContactController.all,
  [Controller.ContactsIn]: ContactController.in,
  [Controller.MessagesAll]: MessageController._all_from_all,
  [Controller.Messages]: MessageController.all,
  [Controller.MessagesVerify]: MessageController.all_verify,
  [Controller.Images]: ImageController.get,
  [Controller.Videos]: VideoController.get,
  [Controller.Voices]: VoiceController.get,
  [Controller.Attaches]: AttachController.get,
  [Controller.Statistic]: StatisticController.get,
  [Controller.Wrapped2024]: Wrapped2024Controller.wrapped2024,
  [Controller.Wrapped2024_RandomMediaMessage]:
    Wrapped2024Controller.get_random_media_message,
};

let directory: FileSystemDirectoryHandle | FileList | undefined = undefined;
const databases: WCDatabases = {};

export type WorkerRequestLoadDirectory = WorkerRequest<
  "load_directory",
  {
    directory: FileSystemDirectoryHandle | FileList;
  }
>;

export type WorkerResponseLoadDirectory = WorkerResponse<{
  data: {
    directory: FileSystemDirectoryHandle | FileList;
    accounts: User[];
  };
}>;

async function loadDirectory(
  directoryHandle: FileSystemDirectoryHandle | FileList,
): Promise<WorkerResponseLoadDirectory["payload"]> {
  if (!directoryHandle) throw new Error("directory is not loaded");

  directory = directoryHandle;

  const SQL = await initSqlJs({ locateFile: () => sqliteUrl });

  const manifestDatabaseFile = await getFileFromDirectory(
    directory,
    "Manifest.db",
  );
  if (!manifestDatabaseFile) throw new Error("Manifest.db not found");
  const manifestDatabaseFileBuffer = await manifestDatabaseFile.arrayBuffer();
  const manifestDatabase = new SQL.Database(
    new Uint8Array(manifestDatabaseFileBuffer),
  );

  databases.manifest = manifestDatabase;

  const localInfoBuffer = (
    await getFilesFromManifast(
      manifestDatabase,
      directory,
      "Documents/LocalInfo.data",
    )
  )[0].file;

  const loginedUserId = parseLocalInfo(
    new Uint8Array(await localInfoBuffer.arrayBuffer()),
  ).id;

  const mmsettingFiles = await getFilesFromManifast(
    manifestDatabase,
    directory,
    "Documents/MMappedKV/mmsetting.archive.%",
  );

  const accounts: User[] = [];

  for (const row of mmsettingFiles) {
    if (/mmsetting\.archive\.[^.]+$/.test(row.filename)) {
      accounts.push(
        parseUserFromMmsetting(new Uint8Array(await row.file.arrayBuffer())),
      );
    }
  }

  return {
    success: true,
    data: {
      directory,
      accounts: accounts.sort((a) => (a.id === loginedUserId ? -1 : 1)),
    },
  };
}

async function loadDatabases(account: User) {
  if (directory === undefined) {
    console.error("directory is not loaded");
    return;
  }

  if (!databases.manifest) {
    throw Error("Manifest.db is not loaded");
  }

  const accountIdMd5 = CryptoJS.MD5(account.id).toString();

  const SQL = await initSqlJs({ locateFile: () => sqliteUrl });

  let databaseFileBuffer: ArrayBuffer;

  databaseFileBuffer = await (
    await getFilesFromManifast(
      databases.manifest,
      directory,
      `Documents/${accountIdMd5}/session/session.db`,
    )
  )[0].file.arrayBuffer();
  databases.session = new SQL.Database(new Uint8Array(databaseFileBuffer));

  databaseFileBuffer = await (
    await getFilesFromManifast(
      databases.manifest,
      directory,
      `Documents/${accountIdMd5}/DB/WCDB_Contact.sqlite`,
    )
  )[0].file.arrayBuffer();

  databases.WCDB_Contact = new SQL.Database(new Uint8Array(databaseFileBuffer));

  for (const fileItem of await await getFilesFromManifast(
    databases.manifest,
    directory,
    `Documents/${accountIdMd5}/DB/message_%.sqlite`,
  )) {
    const databaseFileBuffer = await fileItem.file.arrayBuffer();

    if (databases.message === undefined) databases.message = [];

    databases.message.push(
      new SQL.Database(new Uint8Array(databaseFileBuffer)),
    );
  }

  databaseFileBuffer = await (
    await getFilesFromManifast(
      databases.manifest,
      directory,
      `Documents/${accountIdMd5}/Brand/BrandMsg.db`,
    )
  )[0].file.arrayBuffer();

  databases.BrandMsg = new SQL.Database(new Uint8Array(databaseFileBuffer));

  _global.user = account;

  return {
    success: true,
    data: {
      databases,
      account,
    },
  };
}
async function unloadDatabases() {
  for (const databaseName in databases) {
    if (Array.isArray(databases[databaseName as WCDatabaseNames])) {
      for (const db of databases[
        databaseName as WCDatabaseNames
      ] as Database[]) {
        db.close();
      }
    } else {
      (databases[databaseName as WCDatabaseNames] as Database).close();
    }
  }

  _global.user = undefined;
}

self.onmessage = async (
  event: MessageEvent<
    WorkerRequestLoadDirectory | WorkerRequestLoadDatabases | WorkerRequestQuery
  >,
) => {
  const { id, type, payload } = event.data;
  switch (type) {
    case "load_directory": {
      const { directory } = payload;

      const result = await loadDirectory(directory);
      postMessage({
        id,
        payload: result,
      } as WorkerResponseLoadDirectory);
      break;
    }

    case "load_databases": {
      const { account } = payload;
      const result = await loadDatabases(account);
      postMessage({
        id,
        payload: result,
      } as WorkerResponseLoadDatabases);
      break;
    }

    case "query": {
      const [endpoint, ...args] = payload;

      let result: unknown;
      switch (endpoint) {
        case Controller.Chats:
        case Controller.ChatsIn:
        case Controller.Contacts:
        case Controller.ContactsIn:
        case Controller.MessagesAll:
        case Controller.Messages:
        case Controller.MessagesVerify:
        case Controller.Statistic:
        case Controller.Wrapped2024:
        case Controller.Wrapped2024_RandomMediaMessage:
          result = await controller[endpoint](databases, ...args);
          break;
        case Controller.Images:
        case Controller.Videos:
        case Controller.Voices:
        case Controller.Attaches:
          result = await controller[endpoint](directory, databases, ...args);
          break;
        default:
          break;
      }

      postMessage({
        id,
        payload: result,
      } as WorkerResponseQuery);
      break;
    }
  }
};
