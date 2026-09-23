import type { ImageInfo } from "@repo/types";
import {
	GetMessageImageRequest,
	GetMessageImageResponse,
} from "@repo/types/adapter";
import CryptoJS from "crypto-js";
import type { WCDatabases } from "../types";
import { getFileRecordsFromManifest } from "../utils";
import { createImageUri } from "./file/utils";
import { readMediaDimensions } from "./media-dimensions";

export type GetInput = [
	GetMessageImageRequest,
	{
		databases: WCDatabases;
	},
];
export type GetOutput = GetMessageImageResponse;

export async function get(...inputs: GetInput): GetOutput {
	const [request, { databases }] = inputs;
	const { account, chat, message, sizes, domain = "image" } = request;
	const img =
		request.domain === "opendata"
			? undefined
			: request.message.message_entity.msg.img;
	const dimensions = img
		? {
				hd: readMediaDimensions(img["@_cdnhdwidth"], img["@_cdnhdheight"]),
				regular: readMediaDimensions(
					img["@_cdnmidwidth"],
					img["@_cdnmidheight"],
				),
				thumbnail: readMediaDimensions(
					img["@_cdnthumbwidth"],
					img["@_cdnthumbheight"],
				),
			}
		: undefined;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFileRecordsFromManifest(
		db,
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
		const appendFiles = await getFileRecordsFromManifest(
			db,
			`Documents/${CryptoJS.MD5(account.id).toString()}/ImgV2/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
		);

		files.push(...appendFiles);
	}

	const result: ImageInfo = {};

	for (const file of files) {
		const relativePath = file.relativePath!;
		if (relativePath.endsWith(".pic_hd")) {
			if (!sizeIncludeMap.hd) continue;
			result.hd = {
				uri: createImageUri(relativePath),
				...dimensions?.hd,
			};
		} else if (relativePath.endsWith(".pic")) {
			if (!sizeIncludeMap.regular) continue;
			result.regular = {
				uri: createImageUri(relativePath),
				...dimensions?.regular,
			};
		} else if (relativePath.endsWith(".pic_thum")) {
			if (!sizeIncludeMap.thumbnail) continue;
			result.thumbnail = {
				uri: createImageUri(relativePath),
				...dimensions?.thumbnail,
			};
		} else if (relativePath.endsWith(".pic_thum.tmp")) {
			if (!sizeIncludeMap.thumbnail) continue;
			if (result.thumbnail) continue; // .pic_thum 优先级更高
			result.thumbnail = {
				uri: createImageUri(relativePath),
				...dimensions?.thumbnail,
			};
		} else if (relativePath.endsWith(".pic.mp4")) {
			if (!sizeIncludeMap.video) continue;
			result.video = {
				uri: createImageUri(relativePath),
			};
		}
	}

	return { data: result };
}
