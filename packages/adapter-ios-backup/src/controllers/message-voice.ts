import type { VoiceInfo } from "@repo/types";
import {
	GetMessageVoiceRequest,
	GetMessageVoiceResponse,
} from "@repo/types/adapter";
import CryptoJS from "crypto-js";
import type { WCDatabases } from "../types";
import { getFilesFromManifast } from "../utils";
import type { BackupEncryption } from "../utils/encryption/encryption.ts";
import { convertSilk } from "../utils/silk";

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

	const files = await getFilesFromManifast(
		db,
		directory,
		`Documents/${CryptoJS.MD5(account.id).toString()}/Audio/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
		encryption,
	);

	if (files.length === 0) return { data: undefined };

	let result: VoiceInfo = {
		raw_aud_src: "",
	};

	for (const file of files) {
		if (file.filename.endsWith(".aud")) {
			result = {
				...result,
				raw_aud_src: URL.createObjectURL(file.file),
				src: await convertSilk(await file.file.arrayBuffer()),
			};
		}

		if (file.filename.endsWith(".txt")) {
			result = {
				...result,
				transcription: await file.file.text(),
			};
		}
	}

	return { data: result };
}
