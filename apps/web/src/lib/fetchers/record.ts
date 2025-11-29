import {
	GetRecordFileRequest,
	GetRecordImageRequest,
	GetRecordVideoRequest,
} from "@/adapters/adapter.ts";
import { getDataAdapter } from "../data-adapter";

export function RecordImageQueryOptions(requestData: GetRecordImageRequest) {
	return {
		queryKey: [
			`account: ${requestData.account.id}`,
			`chat: ${requestData.chat.id}`,
			`message: ${requestData.message.local_id}`,
			`record: ${requestData.record["@_dataid"]}`,
			"record-image",
		],
		queryFn: () =>
			getDataAdapter()
				.getRecordImage(requestData)
				.then((res) => res.data ?? null),
	};
}

export function RecordVideoQueryOptions(requestData: GetRecordVideoRequest) {
	return {
		queryKey: [
			`account: ${requestData.account.id}`,
			`chat: ${requestData.chat.id}`,
			`message: ${requestData.message.local_id}`,
			`record: ${requestData.record["@_dataid"]}`,
			"record-video",
		],
		queryFn: () =>
			getDataAdapter()
				.getRecordVideo(requestData)
				.then((res) => res.data ?? null),
	};
}

export function RecordFileQueryOptions(requestData: GetRecordFileRequest) {
	return {
		queryKey: [
			`account: ${requestData.account.id}`,
			`chat: ${requestData.chat.id}`,
			`message: ${requestData.message.local_id}`,
			`record: ${requestData.record["@_dataid"]}`,
			"record-file",
		],
		queryFn: () =>
			getDataAdapter()
				.getRecordFile(requestData)
				.then((res) => res.data ?? null),
	};
}
