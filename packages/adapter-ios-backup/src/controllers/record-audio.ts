import type {
	GetRecordAudioRequest,
	GetRecordAudioResponse,
} from "@repo/types/adapter";
import CryptoJS from "crypto-js";
import type { WCDatabases } from "../types";
import { getFileRecordsFromManifest } from "../utils";
import { createMessageFileUri } from "./file/utils";

export type GetInput = [GetRecordAudioRequest, { databases: WCDatabases }];
export type GetOutput = GetRecordAudioResponse;

export async function get(...inputs: GetInput): GetOutput {
	const [{ account, chat, message, record }, { databases }] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFileRecordsFromManifest(
		db,
		`Documents/${CryptoJS.MD5(account.id).toString()}/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}/${record["@_dataid"]}.${record.datafmt}`,
	);

	if (!files.length) return { data: undefined };

	return { data: { uri: createMessageFileUri(files[0].relativePath!) } };
}
