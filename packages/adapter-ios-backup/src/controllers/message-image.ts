import type { ImageInfo } from "@repo/types";
import {
	GetMessageImageRequest,
	GetMessageImageResponse,
} from "@repo/types/adapter";
import CryptoJS from "crypto-js";
import { WCDatabases } from "../types";
import { getFilesFromManifast } from "../utils";
import { createImageUri } from "./file/utils";

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
		video: !sizes || sizes.includes("video"),
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
			result.hd = {
				uri: createImageUri(file.relativePath),
			};
		} else if (file.filename.endsWith(".pic")) {
			if (!sizeIncludeMap.regular) continue;
			result.regular = {
				uri: createImageUri(file.relativePath),
			};
		} else if (file.filename.endsWith(".pic_thum")) {
			if (!sizeIncludeMap.thumbnail) continue;
			result.thumbnail = {
				uri: createImageUri(file.relativePath),
			};
		} else if (file.filename.endsWith(".pic_thum.tmp")) {
			if (!sizeIncludeMap.thumbnail) continue;
			if (result.thumbnail) continue; // .pic_thum 优先级更高
			result.thumbnail = {
				uri: createImageUri(file.relativePath),
			};
		} else if (file.filename.endsWith(".pic.mp4")) {
			if (!sizeIncludeMap.video) continue;
			result.video = {
				uri: createImageUri(file.relativePath),
			};
		}
	}

	return { data: result };
}
