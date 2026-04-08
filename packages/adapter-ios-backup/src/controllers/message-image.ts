import type { ImageInfo } from "@repo/types";
import {
  GetMessageImageRequest,
  GetMessageImageResponse,
} from "@repo/types/adapter";
import CryptoJS from "crypto-js";
import { WCDatabases } from "../types";
import { getFilesFromManifast } from "../utils";
import { convertWxgfToJpg } from "../utils/wxgf";
import { isWxgf } from "../utils/wxgf/utils";

async function getImageSrc(file: File): Promise<string> {
  const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  if (isWxgf(header)) {
    const data = new Uint8Array(await file.arrayBuffer());
    return convertWxgfToJpg(data);
  }
  return URL.createObjectURL(file);
}

export type GetInput = [
  GetMessageImageRequest,
  { directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];
export type GetOutput = GetMessageImageResponse;

export async function get(...inputs: GetInput): GetOutput {
  const [
    { account, chat, message, sizes, domain = "image" },
    { directory, databases },
  ] = inputs;

  const db = databases.manifest;
  if (!db) throw new Error("manifest database is not found");

  const files = await getFilesFromManifast(
    db,
    directory,
    `Documents/${CryptoJS.MD5(account.id).toString()}/${
      {
        image: "Img",
        opendata: "OpenData",
      }[domain]
    }/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
  );

  const sizeIncludeMap: Record<keyof ImageInfo, boolean> = {
    hd: !sizes || sizes.includes("hd"),
    regular: !sizes || sizes.includes("regular"),
    thumbnail: !sizes || sizes.includes("thumbnail"),
  };

  if (domain === "image") {
    const appendFiles = await getFilesFromManifast(
      db,
      directory,
      `Documents/${CryptoJS.MD5(account.id).toString()}/ImgV2/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
    );

    files.push(...appendFiles);
  }

  const result: ImageInfo = {};

  for (const file of files) {
    if (file.filename.endsWith(".pic_hd")) {
      if (!sizeIncludeMap.hd) continue;
      try {
        result.hd = { src: await getImageSrc(file.file) };
      } catch (error) {
        console.error(
          `[message-image] Failed to load ${file.filename}:`,
          error,
        );
      }
    } else if (file.filename.endsWith(".pic")) {
      if (!sizeIncludeMap.regular) continue;
      try {
        result.regular = { src: await getImageSrc(file.file) };
      } catch (error) {
        console.error(
          `[message-image] Failed to load ${file.filename}:`,
          error,
        );
      }
    } else if (file.filename.endsWith(".pic_thum")) {
      if (!sizeIncludeMap.thumbnail) continue;
      try {
        result.thumbnail = { src: await getImageSrc(file.file) };
      } catch (error) {
        console.error(
          `[message-image] Failed to load ${file.filename}:`,
          error,
        );
      }
      // width: Number.parseInt(messageEntity.msg.img["@_cdnthumbwidth"]),
      // height: Number.parseInt(messageEntity.msg.img["@_cdnthumbheight"]),
    }
  }

  return { data: result };
}
