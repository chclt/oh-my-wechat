import type { VideoInfo } from "@/schema";
import CryptoJS from "crypto-js";
import { getFilesFromManifast } from "../utils";
import { DataAdapterResponse, GetVideoRequest } from "@/adapters/adapter";
import { WCDatabases } from "../types";

export type GetInput = [
	GetVideoRequest,
	{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];
export type GetOutput = Promise<DataAdapterResponse<VideoInfo>>;

export async function get(...inputs: GetInput): GetOutput {
	const [{ message }, { directory, databases }] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFilesFromManifast(
		db,
		directory,
		`%/Video/${CryptoJS.MD5(message.chat_id).toString()}/${message.local_id}.%`,
	);

	let result: VideoInfo = {
		poster: "",
	};

	for (const file of files) {
		if (file.filename.endsWith(".mp4")) {
			result = {
				...result,
				src: URL.createObjectURL(file.file),
			};
		}

		if (file.filename.endsWith(".video_thum")) {
			result = {
				...result,
				poster: URL.createObjectURL(file.file),

				// poster_width: Number.parseInt(
				//   messageEntity.msg.videomsg["@_cdnthumbwidth"],
				// ),
				// poster_height: Number.parseInt(
				//   messageEntity.msg.videomsg["@_cdnthumbheight"],
				// ),
			};
		}
	}

	return { data: result };
}
