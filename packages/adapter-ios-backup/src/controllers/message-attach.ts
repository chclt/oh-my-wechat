import {
	GetMessageAttachRequest,
	GetMessageAttachResponse,
} from "@repo/types/adapter";
import CryptoJS from "crypto-js";
import type { WCDatabases } from "../types";
import { getFileFromDirectory, getFileRecordsFromManifest } from "../utils";
import type { BackupEncryption } from "../utils/encryption/encryption.ts";
import { createMessageFileUri } from "./file/utils";

export type GetInput = [
	GetMessageAttachRequest,
	{
		directory: FileSystemDirectoryHandle | FileList;
		databases: WCDatabases;
		encryption?: BackupEncryption;
	},
];
export type GetOutput = GetMessageAttachResponse;

export async function get(...inputs: GetInput): GetOutput {
	const [{ account, chat, message }, { directory, databases }] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFileRecordsFromManifest(
		db,
		`Documents/${CryptoJS.MD5(account.id).toString()}/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
	);
	for (const file of files) {
		if (!file.fileID || !file.relativePath) continue;
		if (
			await getFileFromDirectory(directory, [
				file.fileID.slice(0, 2),
				file.fileID,
			])
		) {
			return { data: { uri: createMessageFileUri(file.relativePath) } };
		}
	}
	return { data: undefined };
}
