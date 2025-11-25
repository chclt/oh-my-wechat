import {
	DataAdapterResponse,
	GetNoteMessageFileRequest,
} from "@/adapters/adapter";
import { FileInfo } from "@/schema";
import CryptoJS from "crypto-js";
import { WCDatabases } from "../types";
import { getFilesFromManifast } from "../utils";

export type GetInput = [
	GetNoteMessageFileRequest,
	{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
];
export type GetOutput = Promise<DataAdapterResponse<FileInfo | undefined>>;

export async function get(...inputs: GetInput): GetOutput {
	const [{ message, record }, { directory, databases }] = inputs;

	const db = databases.manifest;
	if (!db) throw new Error("manifest database is not found");

	const files = await getFilesFromManifast(
		db,
		directory,
		// @ts-expect-error FIXME
		`%/OpenData/${CryptoJS.MD5(message.chat_id).toString()}/${message.local_id}/${record["@_dataid"]}.${record["datafmt"]}`,
	);

	if (files.length === 0) return { data: undefined };

	const file = files[0];
	return {
		data: {
			src: URL.createObjectURL(file.file),
		},
	};
}
