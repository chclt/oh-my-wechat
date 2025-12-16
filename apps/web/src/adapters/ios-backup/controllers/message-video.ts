import {
	GetMessageVideoRequest,
	GetMessageVideoResponse,
} from "@/adapters/adapter";
import type { VideoInfo } from "@/schema";
import CryptoJS from "crypto-js";
import { WCDatabases } from "../types";
import { getFilesFromManifast } from "../utils";

export type GetInput = [
	GetMessageVideoRequest,
	{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];
export type GetOutput = GetMessageVideoResponse;

export async function get(...inputs: GetInput): GetOutput {
	const [{ account, chat, message, include }, { directory, databases }] =
		inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFilesFromManifast(
		db,
		directory,
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

	let result: VideoInfo = { src: "" };

	for (const file of files) {
		if (file.filename.endsWith(".mp4")) {
			if (!includeMap.video) continue;
			result = {
				...result,
				src: URL.createObjectURL(file.file),
			};
		}

		if (file.filename.endsWith(".video_thum")) {
			if (!includeMap.cover) continue;
			result = {
				...result,
				cover: { src: URL.createObjectURL(file.file) },
			};
		}
	}

	return { data: result };
}
