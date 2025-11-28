import { DataAdapterResponse, GetRecordVideoRequest } from "@/adapters/adapter";
import { VideoInfoNext } from "@/schema";
import CryptoJS from "crypto-js";
import { WCDatabases } from "../types";
import { getFilesFromManifast } from "../utils";

export type GetInput = [
	GetRecordVideoRequest,
	{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];
export type GetOutput = Promise<DataAdapterResponse<VideoInfoNext>>;

export async function get(...inputs: GetInput): GetOutput {
	const [{ chat, message, record }, { directory, databases }] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFilesFromManifast(
		db,
		directory,
		`%/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}/${record["@_dataid"]}.%`,
	);

	let result: VideoInfoNext = { src: "" };

	for (const file of files) {
		if (file.filename.endsWith(".mp4")) {
			result = {
				...result,
				src: URL.createObjectURL(file.file),
			};
		}

		if (file.filename.endsWith(".record_thumb")) {
			result = {
				...result,
				poster: { src: URL.createObjectURL(file.file) },
			};
		}
	}

	return { data: result };
}
