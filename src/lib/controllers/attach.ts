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
    }: {
      chat: Chat;
      message: MessageVM;
    },
  ): Promise<FileInfo[]> => {
    const db = databases.manifest;
    if (!db) throw new Error("manifest database is not found");

    const files = await getFilesFromManifast(
      db,
      directory,
      `%/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
    );

    const result = [];

    for (const file of files) {
      result.push({
        src: URL.createObjectURL(file.file),
      });
    }

    return result;
  },
};
