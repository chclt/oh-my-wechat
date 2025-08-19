import type { FileInfo } from "@/schema";
import CryptoJS from "crypto-js";
import { getFilesFromManifast } from "../utils";
import { DataAdapterResponse, GetAttachRequest } from "@/adapters/adapter";
import { WCDatabases } from "../types";

export type GetInput = [
	GetAttachRequest,
	{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];
export type GetOutput = Promise<DataAdapterResponse<FileInfo[]>>;

export async function get(...inputs: GetInput): GetOutput {
	const [{ chat, message, record, type }, { directory, databases }] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFilesFromManifast(
		db,
		directory,
		record
			? `%/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}/${record["@_dataid"]}.%`
			: `%/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
	);

	const result = [];

	for (const file of files) {
		if (type) {
			const fileBuffer = await file.file.arrayBuffer();
			const fileBlob = new Blob([fileBuffer], { type });
			result.push({
				src: URL.createObjectURL(fileBlob),
			});
		} else {
			result.push({
				src: URL.createObjectURL(file.file),
			});
		}
	}

	return { data: result };
}
