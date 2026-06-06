import { VideoInfo } from "@repo/types";
import {
	DataAdapterResponse,
	GetRecordVideoRequest,
} from "@repo/types/adapter";
import CryptoJS from "crypto-js";
import { WCDatabases } from "../types";
import { getFilesFromManifast } from "../utils";
import { createImageUri } from "./file/utils";

export type GetInput = [
	GetRecordVideoRequest,
	{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];
export type GetOutput = Promise<DataAdapterResponse<VideoInfo>>;

export async function get(...inputs: GetInput): GetOutput {
	const [{ account, chat, message, record }, { directory, databases }] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFilesFromManifast(
		db,
		directory,
		`Documents/${CryptoJS.MD5(account.id).toString()}/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}/${record["@_dataid"]}.%`,
	);

	let result: VideoInfo = { uri: "" };

	for (const file of files) {
		if (file.filename.endsWith(".mp4")) {
			result = {
				...result,
				uri: createImageUri(file.relativePath),
			};
		}

		if (file.filename.endsWith(".record_thumb")) {
			result = {
				...result,
				cover: { uri: createImageUri(file.relativePath) },
			};
		}
	}

	return { data: result };
}
