import { DataAdapterResponse, GetAttachRequest } from "@/adapters/adapter";
import type { FileInfo } from "@/schema";
import CryptoJS from "crypto-js";
import { WCDatabases } from "../types";
import { getFilesFromManifast } from "../utils";

export type GetInput = [
	GetAttachRequest,
	{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];
export type GetOutput = Promise<DataAdapterResponse<FileInfo | undefined>>;

export async function get(...inputs: GetInput): GetOutput {
	const [{ message, record, type }, { directory, databases }] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFilesFromManifast(
		db,
		directory,
		record
			? `%/OpenData/${CryptoJS.MD5(message.chat_id).toString()}/${message.local_id}/${record["@_dataid"]}.%`
			: `%/OpenData/${CryptoJS.MD5(message.chat_id).toString()}/${message.local_id}.%`,
	);

	let result;

	for (const file of files) {
		if (type) {
			const fileBuffer = await file.file.arrayBuffer();
			const fileBlob = new Blob([fileBuffer], { type });
			result = {
				src: URL.createObjectURL(fileBlob),
			};
		} else {
			result = {
				src: URL.createObjectURL(file.file),
			};
		}
		break;
	}

	return { data: result };
}
