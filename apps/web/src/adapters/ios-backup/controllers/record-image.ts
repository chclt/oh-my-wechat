import {
	GetRecordImageRequest,
	GetRecordImageResponse,
} from "@/adapters/adapter";
import { ImageInfo } from "@/schema";
import CryptoJS from "crypto-js";
import { WCDatabases } from "../types";
import { getFilesFromManifast } from "../utils";

export type GetInput = [
	GetRecordImageRequest,
	{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];
export type GetOutput = GetRecordImageResponse;

export async function get(...inputs: GetInput): GetOutput {
	const [{ chat, message, record }, { directory, databases }] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFilesFromManifast(
		db,
		directory,
		`%/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}/${record["@_dataid"]}.%`,
	);

	const result: ImageInfo = {};

	for (const file of files) {
		if (file.filename.endsWith(".record_dat")) {
			result.regular = { src: URL.createObjectURL(file.file) };
		} else if (file.filename.endsWith(".record_thumb")) {
			result.regular = { src: URL.createObjectURL(file.file) };
		}
	}

	return { data: result };
}
