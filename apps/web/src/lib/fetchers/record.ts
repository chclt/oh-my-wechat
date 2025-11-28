import * as NoteMessageFileController from "@/adapters/ios-backup/controllers/record-file.ts";
import * as NoteMessageImageController from "@/adapters/ios-backup/controllers/record-image.ts";
import * as NoteMessageVideoController from "@/adapters/ios-backup/controllers/record-video.ts";
import { getDataAdapter } from "../data-adapter";
import {
	GetRecordFileRequest,
	GetRecordImageRequest,
	GetRecordVideoRequest,
} from "@/adapters/adapter.ts";

export function RecordImageQueryOptions(requestData: GetRecordImageRequest) {
	return {
		queryKey: [
			`account: ${requestData.accountId}`,
			`chat: ${requestData.chat.id}`,
			`message: ${requestData.message.local_id}`,
			`record: ${requestData.record["@_dataid"]}`,
			"record-image",
		],
		queryFn: () =>
			getDataAdapter()
				.getNoteMessageImage(requestData)
				.then((res) => res.data),
	};
}

export function RecordVideoQueryOptions(requestData: GetRecordVideoRequest) {
	return {
		queryKey: [
			`account: ${requestData.accountId}`,
			`chat: ${requestData.chat.id}`,
			`message: ${requestData.message.local_id}`,
			`record: ${requestData.record["@_dataid"]}`,
			"record-video",
		],
		queryFn: () =>
			getDataAdapter()
				.getNoteMessageVideo(requestData)
				.then((res) => res.data),
	};
}

export function RecordFileQueryOptions(requestData: GetRecordFileRequest) {
	return {
		queryKey: [
			`account: ${requestData.accountId}`,
			`chat: ${requestData.chat.id}`,
			`message: ${requestData.message.local_id}`,
			`record: ${requestData.record["@_dataid"]}`,
			"record-file",
		],
		queryFn: () => getDataAdapter().getNoteMessageFile(requestData),
	};
}
