import {
	GetRecordFileRequest,
	GetRecordAudioRequest,
	GetRecordImageRequest,
	GetRecordVideoRequest,
} from "@repo/types/adapter";
import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { getDataAdapter } from "../data-adapter";
import { downloadMessageFile } from "../download-message-file";

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

export function RecordFileDownloadMutationOptions(
	requestData: GetRecordFileRequest,
	filename: string,
) {
	return mutationOptions({
		mutationKey: [
			`account: ${requestData.account.id}`,
			`chat: ${requestData.chat.id}`,
			`message: ${requestData.message.local_id}`,
			`record: ${requestData.record["@_dataid"]}`,
			"download-record-file",
		],
		mutationFn: async () => {
			const adapter = getDataAdapter();
			const { data } = await adapter.getRecordFile(requestData);
			if (data) await downloadMessageFile(adapter, data.uri, filename);
			return data ?? null;
		},
	});
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

export function NoteDocumentQueryOptions(
	requestData: Omit<GetRecordFileRequest, "record"> & {
		record: GetRecordFileRequest["record"] | undefined;
	},
) {
	const { record } = requestData;
	return queryOptions({
		queryKey: [
			`account: ${requestData.account.id}`,
			`chat: ${requestData.chat.id}`,
			`message: ${requestData.message.local_id}`,
			`record: ${record?.["@_dataid"]}`,
			"note-document",
		],
		queryFn: async ({ signal }) => {
			if (!record) return null;
			const adapter = getDataAdapter();
			const { data: file } = await adapter.getRecordFile({
				...requestData,
				record,
			});
			if (!file) return null;
			signal.throwIfAborted();
			const referenceId = crypto.randomUUID();
			try {
				const {
					data: { src },
				} = await adapter.resolveMessageFile({
					uri: file.uri,
					referenceId,
					raw: true,
				});
				const response = await fetch(src, { signal });
				if (!response.ok)
					throw new Error(`Cannot read note: ${response.status}`);
				return await response.text();
			} finally {
				await adapter.releaseMessageFile({ referenceId }).catch(() => {});
			}
		},
	});
}
