import type { VideoInfo } from "@repo/types";
import {
	GetMessageVideoRequest,
	GetMessageVideoResponse,
} from "@repo/types/adapter";
import CryptoJS from "crypto-js";
import type { WCDatabases } from "../types";
import { getFileRecordsFromManifest } from "../utils";
import { createMessageFileUri } from "./file/utils";
import { readMediaDimensions } from "./media-dimensions";

export type GetInput = [
	GetMessageVideoRequest,
	{
		databases: WCDatabases;
	},
];
export type GetOutput = GetMessageVideoResponse;

export async function get(...inputs: GetInput): GetOutput {
	const [{ account, chat, message, include }, { databases }] = inputs;
	const video = message.message_entity.msg.videomsg;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFileRecordsFromManifest(
		db,
		`Documents/${CryptoJS.MD5(account.id).toString()}/Video/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
	);

	if (!files.length) return { data: undefined };

	const includeMap: Record<
		NonNullable<GetMessageVideoRequest["include"]>[number],
		boolean
	> = {
		video: !include || include.includes("video"),
		cover: !include || include.includes("cover"),
	};

	let result: VideoInfo = { uri: "" };

	for (const file of files) {
		const relativePath = file.relativePath!;
		if (relativePath.endsWith(".mp4")) {
			if (!includeMap.video) continue;
			result = {
				...result,
				uri: createMessageFileUri(relativePath),
			};
		}

		if (relativePath.endsWith(".video_thum")) {
			if (!includeMap.cover) continue;
			result = {
				...result,
				cover: {
					uri: createMessageFileUri(relativePath),
					...readMediaDimensions(
						video["@_cdnthumbwidth"],
						video["@_cdnthumbheight"],
					),
				},
			};
		}
	}

	return { data: result };
}
