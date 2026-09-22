import { VideoInfo } from "@repo/types";
import {
	DataAdapterResponse,
	GetRecordVideoRequest,
} from "@repo/types/adapter";
import CryptoJS from "crypto-js";
import type { WCDatabases } from "../types";
import { getFileRecordsFromManifest } from "../utils";
import { createImageUri } from "./file/utils";

export type GetInput = [
	GetRecordVideoRequest,
	{
		databases: WCDatabases;
	},
];
export type GetOutput = Promise<DataAdapterResponse<VideoInfo>>;

export async function get(...inputs: GetInput): GetOutput {
	const [{ account, chat, message, record }, { databases }] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFileRecordsFromManifest(
		db,
		`Documents/${CryptoJS.MD5(account.id).toString()}/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}/${record["@_dataid"]}.%`,
	);

	let result: VideoInfo = { uri: "" };

	for (const file of files) {
		const relativePath = file.relativePath!;
		if (relativePath.endsWith(".mp4")) {
			result = {
				...result,
				uri: createImageUri(relativePath),
			};
		}

		if (relativePath.endsWith(".record_thumb")) {
			result = {
				...result,
				cover: { uri: createImageUri(relativePath) },
			};
		}
	}

	return { data: result };
}
