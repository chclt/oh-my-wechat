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
import { adapterWorker } from "../worker";

const createImageFileUri = ({
	accountId,
	chatId,
	messageLocalId,
	filename,
}: {
	accountId: string;
	chatId: string;
	messageLocalId: string;
	filename: string;
}) => {
	return `ios-backup:account:${accountId}:chat:${chatId}:message:${messageLocalId}:image:${filename}`;
};

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
			result.hd = {
				uri: createImageFileUri({
					accountId: adapterWorker._getStoreItem("account").id,
					chatId: chat.id,
					messageLocalId: message.local_id,
					filename: file.filename,
				}),
				requiresReleaseAck: true,
			};
			if (sizeIncludeMap.hd) {
				try {
					result.hd.src = await getImageSrc(file.file);
				} catch (error) {
					console.error(
						`[message-image] Failed to load ${file.filename}:`,
						error,
					);
				}
			}
		} else if (file.filename.endsWith(".pic")) {
			result.regular = {
				uri: createImageFileUri({
					accountId: adapterWorker._getStoreItem("account").id,
					chatId: chat.id,
					messageLocalId: message.local_id,
					filename: file.filename,
				}),
				requiresReleaseAck: true,
			};
			if (sizeIncludeMap.regular) {
				try {
					result.regular.src = await getImageSrc(file.file);
				} catch (error) {
					console.error(
						`[message-image] Failed to load ${file.filename}:`,
						error,
					);
				}
			}
		} else if (file.filename.endsWith(".pic_thum")) {
			result.thumbnail = {
				uri: createImageFileUri({
					accountId: adapterWorker._getStoreItem("account").id,
					chatId: chat.id,
					messageLocalId: message.local_id,
					filename: file.filename,
				}),
				requiresReleaseAck: true,
			};
			if (sizeIncludeMap.thumbnail) {
				try {
					result.thumbnail.src = await getImageSrc(file.file);
				} catch (error) {
					console.error(
						`[message-image] Failed to load ${file.filename}:`,
						error,
					);
				}
			}
			// width: Number.parseInt(messageEntity.msg.img["@_cdnthumbwidth"]),
			// height: Number.parseInt(messageEntity.msg.img["@_cdnthumbheight"]),
		} else if (file.filename.endsWith(".pic_thum.tmp")) {
			if (result.thumbnail) continue; // .pic_thum 优先级更高
			result.thumbnail = {
				uri: createImageFileUri({
					accountId: adapterWorker._getStoreItem("account").id,
					chatId: chat.id,
					messageLocalId: message.local_id,
					filename: file.filename,
				}),
				requiresReleaseAck: true,
			};
			if (sizeIncludeMap.thumbnail) {
				try {
					result.thumbnail.src = await getImageSrc(file.file);
				} catch (error) {
					console.error(
						`[message-image] Failed to load ${file.filename}:`,
						error,
					);
				}
			}
		} else if (file.filename.endsWith(".pic.mp4")) {
			result.video = {
				uri: createImageFileUri({
					accountId: adapterWorker._getStoreItem("account").id,
					chatId: chat.id,
					messageLocalId: message.local_id,
					filename: file.filename,
				}),
				requiresReleaseAck: true,
			};
			if (sizeIncludeMap.video) {
				try {
					result.video.src = URL.createObjectURL(file.file);
				} catch (error) {
					console.error(
						`[message-image] Failed to load ${file.filename}:`,
						error,
					);
				}
			}
		}
	}

	return { data: result };
}
