import type { ChatType, MessageType, VideoInfo, WCDatabases } from "@/schema";
import CryptoJS from "crypto-js";
import { getFilesFromManifast } from "../utils";

export namespace VideoController {
	export type GetInput = [
		{
			chat: ChatType;
			message: MessageType;
		},
		{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
	];
	export type GetOutput = Promise<VideoInfo>;

	export async function get(...inputs: GetInput): GetOutput {
		const [{ chat, message }, { directory, databases }] = inputs;

		const db = databases.manifest;
		if (!db) throw new Error("manifest database is not found");

		const files = await getFilesFromManifast(
			db,
			directory,
			`%/Video/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
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

		return result;
	}
}
