import {
	GetMessageAttachRequest,
	GetMessageAttachResponse,
} from "@/adapters/adapter";
import CryptoJS from "crypto-js";
import { WCDatabases } from "../types";
import { getFilesFromManifast } from "../utils";

export type GetInput = [
	GetMessageAttachRequest,
	{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];
export type GetOutput = GetMessageAttachResponse;

export async function get(...inputs: GetInput): GetOutput {
	const [{ chat, message, type }, { directory, databases }] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFilesFromManifast(
		db,
		directory,
		`%/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
	);

	if (files.length === 0) return { data: undefined };

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
