import type { VoiceInfo } from "@repo/types";
import {
	GetMessageVoiceRequest,
	GetMessageVoiceResponse,
} from "@repo/types/adapter";
import CryptoJS from "crypto-js";
import type { WCDatabases } from "../types";
import { getFileRecordsFromManifest, readManifestFile } from "../utils";
import type { BackupEncryption } from "../utils/encryption/encryption.ts";
import { createMessageFileUri } from "./file/utils";

export type GetInput = [
	GetMessageVoiceRequest,
	{
		directory: FileSystemDirectoryHandle | FileList;
		databases: WCDatabases;
		encryption?: BackupEncryption;
	},
];
export type GetOutput = GetMessageVoiceResponse;

export async function get(...inputs: GetInput): GetOutput {
	const [
		{ account, chat, message, include },
		{ directory, databases, encryption },
	] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFileRecordsFromManifest(
		db,
		`Documents/${CryptoJS.MD5(account.id).toString()}/Audio/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
	);

	if (files.length === 0) return { data: undefined };

	let result: VoiceInfo = {};

	for (const file of files) {
		const relativePath = file.relativePath!;
		if (relativePath.endsWith(".aud")) {
			result = {
				...result,
				uri: createMessageFileUri(relativePath),
			};
		}

		if (relativePath.endsWith(".txt")) {
			const text = await readManifestFile(directory, file, encryption);
			result = {
				...result,
				transcription: await text?.text(),
			};
		}
	}

	return { data: result };
}
