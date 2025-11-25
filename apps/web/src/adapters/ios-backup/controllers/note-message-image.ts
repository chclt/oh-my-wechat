import {
	DataAdapterResponse,
	GetNoteMessageImageRequest,
} from "@/adapters/adapter";
import { ImageInfoNext } from "@/schema";
import CryptoJS from "crypto-js";
import { WCDatabases } from "../types";
import { getFilesFromManifast } from "../utils";

export type GetInput = [
	GetNoteMessageImageRequest,
	{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];
export type GetOutput = Promise<DataAdapterResponse<ImageInfoNext>>;

export async function get(...inputs: GetInput): GetOutput {
	const [{ message, record }, { directory, databases }] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFilesFromManifast(
		db,
		directory,
		`%/OpenData/${CryptoJS.MD5(message.chat_id).toString()}/${message.local_id}/${record["@_dataid"]}.%`,
	);

	const result: ImageInfoNext = {};

	for (const file of files) {
		if (file.filename.endsWith(".record_dat")) {
			result.regular = { src: URL.createObjectURL(file.file) };
		} else if (file.filename.endsWith(".record_thumb")) {
			result.regular = { src: URL.createObjectURL(file.file) };
		}
	}

	return { data: result };
}
