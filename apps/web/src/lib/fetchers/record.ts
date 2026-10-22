import {
	GetRecordFileRequest,
	GetRecordAudioRequest,
	GetRecordImageRequest,
	GetRecordVideoRequest,
} from "@repo/types/adapter";
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

export function RecordFileQueryOptions(
	requestData: Omit<GetRecordFileRequest, "record"> & {
		record: GetRecordFileRequest["record"] | undefined;
	},
) {
	const { record } = requestData;
	return {
		queryKey: [
			`account: ${requestData.account.id}`,
			`chat: ${requestData.chat.id}`,
			`message: ${requestData.message.local_id}`,
			`record: ${record?.["@_dataid"]}`,
			"record-file",
		],
		queryFn: async () => {
			if (!record) return null;
			const { data } = await getDataAdapter().getRecordFile({
				...requestData,
				record,
			});
			return data ?? null;
		},
	};
}

export function RecordAudioQueryOptions(requestData: GetRecordAudioRequest) {
	return {
		queryKey: [
			`account: ${requestData.account.id}`,
			`chat: ${requestData.chat.id}`,
			`message: ${requestData.message.local_id}`,
			`record: ${requestData.record["@_dataid"]}`,
			"record-audio",
		],
		queryFn: () =>
			getDataAdapter()
				.getRecordAudio(requestData)
				.then((res) => res.data ?? null),
	};
}
