import type { RecordVM } from "@/components/record/record";
import type { Chat, MessageVM, PhotpSize, WCDatabases } from "@/lib/schema.ts";
import CryptoJS from "crypto-js";
import { getFilesFromManifast } from "../utils";

export const ImageController = {
  get: async (
    directory: FileSystemDirectoryHandle,
    databases: WCDatabases,
    {
      chat,
      message,
      record,

      size = "origin",
      domain = "image",
    }: {
      chat: Chat;
      message: MessageVM;
      record?: RecordVM;

      size: "origin" | "thumb";
      domain: "image" | "opendata" | "video";
    },
  ): Promise<PhotpSize[]> => {
    const db = databases.manifest;
    if (!db) throw new Error("manifest database is not found");

    const files = await getFilesFromManifast(
      db,
      directory,
      record
        ? `%/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}/${record["@_dataid"]}.%`
        : `%/${
            { image: "Img", opendata: "OpenData", video: "Video" }[domain]
          }/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
    );

    const result: PhotpSize[] = [];

    for (const file of files) {
      if (file.filename.endsWith(".pic")) {
        const newPhoto: PhotpSize = {
          size: "origin",
          src: URL.createObjectURL(file.file),
        };
        if (size === "origin") result.push(newPhoto);
        else result.unshift(newPhoto);
      }

      if (
        file.filename.endsWith(".pic_thum") ||
        file.filename.endsWith(".record_thum")
      ) {
        const newPhoto: PhotpSize = {
          size: "thumb",
          src: URL.createObjectURL(file.file),
          // width: Number.parseInt(messageEntity.msg.img["@_cdnthumbwidth"]),
          // height: Number.parseInt(messageEntity.msg.img["@_cdnthumbheight"]),
        };
        if (size === "origin") result.push(newPhoto);
        else result.unshift(newPhoto);
      }

      if (file.filename.endsWith(".video_thum")) {
        const newPhoto: PhotpSize = {
          size: "thumb",
          src: URL.createObjectURL(file.file),
          // width: Number.parseInt(messageEntity.msg.img["@_cdnthumbwidth"]),
          // height: Number.parseInt(messageEntity.msg.img["@_cdnthumbheight"]),
        };
        if (size === "origin") result.push(newPhoto);
        else result.unshift(newPhoto);
      }
    }

    return result;
  },
};
