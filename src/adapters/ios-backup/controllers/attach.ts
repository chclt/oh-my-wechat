import type { RecordType } from "@/components/record/record";
import type {
	ChatType,
	FileInfo,
	MessageType,
	WCDatabases,
} from "@/lib/schema.ts";
import CryptoJS from "crypto-js";
import { getFilesFromManifast } from "../utils";

export namespace AttachController {
	export type GetInput = [
		{
			chat: ChatType;
			message: MessageType;
			record?: RecordType;
			type: string;
		},
		{ directory: FileSystemDirectoryHandle | FileList; databases: WCDatabases },
	];
	export type GetOutput = Promise<FileInfo[]>;

	export async function get(...inputs: GetInput): GetOutput {
		const [{ chat, message, record, type }, { directory, databases }] = inputs;

		const db = databases.manifest;
		if (!db) throw new Error("manifest database is not found");

		const files = await getFilesFromManifast(
			db,
			directory,
			record
				? `%/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}/${record["@_dataid"]}.%`
				: `%/OpenData/${CryptoJS.MD5(chat.id).toString()}/${message.local_id}.%`,
		);

		const result = [];

		for (const file of files) {
			if (type) {
				const fileBuffer = await file.file.arrayBuffer();
				const fileBlob = new Blob([fileBuffer], { type });
				result.push({
					src: URL.createObjectURL(fileBlob),
				});
			} else {
				result.push({
					src: URL.createObjectURL(file.file),
				});
			}
		}

		return result;
	}
}
