import { ImageInfo } from "@repo/types";
import {
	GetRecordImageRequest,
	GetRecordImageResponse,
} from "@repo/types/adapter";
import CryptoJS from "crypto-js";
import type { WCDatabases } from "../types";
import { getFileRecordsFromManifest } from "../utils";
import { createImageUri } from "./file/utils";

export type GetInput = [
	GetRecordImageRequest,
	{
		databases: WCDatabases;
	},
];
export type GetOutput = GetRecordImageResponse;

export async function get(...inputs: GetInput): GetOutput {
	const [{ account, chat, message, record }, { databases }] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFileRecordsFromManifest(
		db,
		`Documents/${CryptoJS.MD5(account.id).toString()}/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}/${record["@_dataid"]}.%`,
	);

	const result: ImageInfo = {};

	for (const file of files) {
		const relativePath = file.relativePath!;
		if (relativePath.endsWith(".record_dat")) {
			result.regular = { uri: createImageUri(relativePath) };
		} else if (relativePath.endsWith(".record_thumb")) {
			result.regular = { uri: createImageUri(relativePath) };
		}
	}

	return { data: result };
}
