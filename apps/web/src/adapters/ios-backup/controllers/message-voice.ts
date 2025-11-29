import {
	GetMessageVoiceRequest,
	GetMessageVoiceResponse,
} from "@/adapters/adapter";
import type { VoiceInfo } from "@/schema";
import CryptoJS from "crypto-js";
import { WCDatabases } from "../types";
import { getFilesFromManifast } from "../utils";
import { convertSilk } from "../utils/silk";

export type GetInput = [
	GetMessageVoiceRequest,
	{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];
export type GetOutput = GetMessageVoiceResponse;

export async function get(...inputs: GetInput): GetOutput {
	const [{ chat, message, include }, { directory, databases }] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFilesFromManifast(
		db,
		directory,
		`%/Audio/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
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
