import { ImageInfo } from "@repo/types";
import {
	GetRecordImageRequest,
	GetRecordImageResponse,
} from "@repo/types/adapter";
import CryptoJS from "crypto-js";
import { WCDatabases } from "../types";
import { getFilesFromManifast } from "../utils";
import { createImageUri } from "./file/utils";

export type GetInput = [
	GetRecordImageRequest,
	{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];
export type GetOutput = GetRecordImageResponse;

export async function get(...inputs: GetInput): GetOutput {
	const [{ account, chat, message, record }, { directory, databases }] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFilesFromManifast(
		db,
		directory,
		`Documents/${CryptoJS.MD5(account.id).toString()}/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}/${record["@_dataid"]}.%`,
	);

	const result: ImageInfo = {};

	for (const file of files) {
		if (file.filename.endsWith(".record_dat")) {
			result.regular = { uri: createImageUri(file.relativePath) };
		} else if (file.filename.endsWith(".record_thumb")) {
			result.regular = { uri: createImageUri(file.relativePath) };
		}
	}

	return { data: result };
}
