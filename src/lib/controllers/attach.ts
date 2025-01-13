import type { RecordVM } from "@/components/record/record";
import type { Chat, FileInfo, MessageVM, WCDatabases } from "@/lib/schema.ts";
import CryptoJS from "crypto-js";
import { getFilesFromManifast } from "../utils";

export const AttachController = {
  get: async (
    directory: FileSystemDirectoryHandle,
    databases: WCDatabases,
    {
      chat,
      message,
      record,

      type,
    }: {
      chat: Chat;
      message: MessageVM;
      record?: RecordVM;

      type: string;
    },
  ): Promise<FileInfo[]> => {
    const db = databases.manifest;
    if (!db) throw new Error("manifest database is not found");

    const files = await getFilesFromManifast(
      db,
      directory,
      record
        ? `%/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}/${record["@_dataid"]}.%`
        : `%/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
    );

    const result = [];

    for (const file of files) {
      if (type) {
        const fileBuffer = await file.file.arrayBuffer();
        const fileBlob = new Blob([fileBuffer], { type });
        result.push({
          src: URL.createObjectURL(fileBlob),
        });
      } else {
        result.push({
          src: URL.createObjectURL(file.file),
        });
      }
    }

    return result;
  },
};
